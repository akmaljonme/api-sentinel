// Parse an OpenAPI spec (YAML or JSON), extract endpoints, persist parsed_data.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { parse as parseYaml } from "https://deno.land/std@0.168.0/encoding/yaml.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { spec_id } = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: spec, error: specErr } = await supabase
      .from("specs").select("content").eq("id", spec_id).single();
    if (specErr || !spec) throw new Error("Spec not found");

    let parsed: any;
    const trimmed = spec.content.trim();
    try {
      parsed = trimmed.startsWith("{") ? JSON.parse(trimmed) : parseYaml(trimmed);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid spec: " + (e as Error).message }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const endpoints: any[] = [];
    for (const [path, pathItem] of Object.entries(parsed.paths || {})) {
      for (const method of ["get", "post", "put", "patch", "delete", "head", "options"]) {
        const op = (pathItem as any)?.[method];
        if (op) {
          endpoints.push({
            method: method.toUpperCase(),
            path,
            operationId: op.operationId,
            summary: op.summary,
            description: op.description,
            parameters: op.parameters || [],
            requestBody: op.requestBody,
            responses: op.responses,
            tags: op.tags || [],
          });
        }
      }
    }

    const parsed_data = {
      title: parsed.info?.title || "Untitled API",
      version: parsed.info?.version || "1.0.0",
      description: parsed.info?.description,
      endpoints,
      schemas: Object.keys(parsed.components?.schemas || {}),
      servers: parsed.servers || [],
      tags: parsed.tags || [],
    };

    await supabase.from("specs").update({
      parsed_data,
      version: parsed_data.version,
      name: parsed_data.title,
      endpoint_count: endpoints.length,
      updated_at: new Date().toISOString(),
    }).eq("id", spec_id);

    return new Response(JSON.stringify({ success: true, parsed_data }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
