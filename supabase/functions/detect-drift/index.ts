// Compare two OpenAPI specs and produce a drift report.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { parse as parseYaml } from "https://deno.land/std@0.168.0/encoding/yaml.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function parseSpec(content: string): any | null {
  try {
    const t = content.trim();
    return t.startsWith("{") ? JSON.parse(t) : parseYaml(t);
  } catch { return null; }
}

function extractEndpoints(spec: any): Map<string, any> {
  const m = new Map<string, any>();
  for (const [path, item] of Object.entries(spec?.paths || {})) {
    for (const method of ["get", "post", "put", "patch", "delete", "head"]) {
      const op = (item as any)?.[method];
      if (op) m.set(`${method.toUpperCase()}:${path}`, op);
    }
  }
  return m;
}

function getRequired(op: any): Set<string> {
  return new Set(op?.requestBody?.content?.["application/json"]?.schema?.required || []);
}
function getResponseProps(op: any): Record<string, any> {
  return op?.responses?.["200"]?.content?.["application/json"]?.schema?.properties || {};
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { spec_id, old_content, new_content } = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const oldSpec = parseSpec(old_content);
    const newSpec = parseSpec(new_content);
    if (!oldSpec || !newSpec) {
      return new Response(JSON.stringify({ error: "Could not parse one or both specs" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const oldEps = extractEndpoints(oldSpec);
    const newEps = extractEndpoints(newSpec);
    const changes: any[] = [];

    for (const [key] of oldEps) {
      if (!newEps.has(key)) {
        const [method, ...rest] = key.split(":");
        changes.push({
          severity: "breaking", type: "endpoint_removed",
          path: `${method} ${rest.join(":")}`,
          message: "Endpoint removed — clients will receive 404",
          suggestion: "Add deprecation header first, return 410 Gone for 30 days",
        });
      }
    }

    for (const [key, newOp] of newEps) {
      const [method, ...rest] = key.split(":");
      const display = `${method} ${rest.join(":")}`;
      const oldOp = oldEps.get(key);

      if (!oldOp) {
        changes.push({ severity: "info", type: "endpoint_added", path: display,
          message: "New endpoint added — backward compatible" });
        continue;
      }

      const oldReq = getRequired(oldOp);
      const newReq = getRequired(newOp);
      for (const f of newReq) if (!oldReq.has(f)) changes.push({
        severity: "breaking", type: "required_field_added",
        path: `${display} → body.${f}`,
        message: `New required field added: "${f}"`,
        suggestion: "Make field optional with default value, or create v2 endpoint",
      });
      for (const f of oldReq) if (!newReq.has(f)) changes.push({
        severity: "info", type: "required_field_removed",
        path: `${display} → body.${f}`,
        message: `Required field removed: "${f}" — now optional`,
      });

      const oldP = getResponseProps(oldOp);
      const newP = getResponseProps(newOp);
      for (const [f, np] of Object.entries(newP)) {
        const op2 = oldP[f];
        if (op2 && op2.type !== (np as any).type) changes.push({
          severity: "breaking", type: "response_type_changed",
          path: `${display} → response.${f}`,
          message: `Type changed: ${op2.type} → ${(np as any).type}`,
          suggestion: "Keep old type as alias until all clients migrate",
        });
      }
      for (const f of Object.keys(oldP)) if (!newP[f]) changes.push({
        severity: "warning", type: "response_field_removed",
        path: `${display} → response.${f}`,
        message: `Response field removed: "${f}"`,
        suggestion: "Clients depending on this field will break silently",
      });
      for (const f of Object.keys(newP)) if (!oldP[f]) changes.push({
        severity: "info", type: "response_field_added",
        path: `${display} → response.${f}`,
        message: `New response field: "${f}" — backward compatible`,
      });
    }

    const breaking = changes.filter((c) => c.severity === "breaking").length;
    const warnings = changes.filter((c) => c.severity === "warning").length;
    const info = changes.filter((c) => c.severity === "info").length;

    const { data: report } = await supabase.from("drift_reports").insert({
      spec_id,
      old_version: oldSpec.info?.version,
      new_version: newSpec.info?.version,
      old_content, new_content,
      breaking_count: breaking,
      warning_count: warnings,
      info_count: info,
      changes,
    }).select().single();

    return new Response(JSON.stringify({ report, changes, breaking, warnings, info }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
