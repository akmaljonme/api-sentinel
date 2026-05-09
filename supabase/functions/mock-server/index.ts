// Mock server: routes /mock-server/{mockServerId}/<api-path> to schema-generated JSON.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*",
};

function generateValue(schema: any): any {
  if (!schema) return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.enum) return schema.enum[Math.floor(Math.random() * schema.enum.length)];

  const formats: Record<string, () => any> = {
    email: () => `user_${Math.random().toString(36).slice(2, 7)}@example.com`,
    uri: () => `https://example.com/${Math.random().toString(36).slice(2, 7)}`,
    url: () => `https://example.com/${Math.random().toString(36).slice(2, 7)}`,
    date: () => new Date(Date.now() - Math.random() * 1e10).toISOString().split("T")[0],
    "date-time": () => new Date(Date.now() - Math.random() * 1e10).toISOString(),
    uuid: () => crypto.randomUUID(),
    password: () => "***",
    hostname: () => `host-${Math.random().toString(36).slice(2, 7)}`,
    ipv4: () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join("."),
  };
  if (schema.format && formats[schema.format]) return formats[schema.format]();

  switch (schema.type) {
    case "object": {
      const obj: any = {};
      for (const [k, v] of Object.entries(schema.properties || {})) obj[k] = generateValue(v);
      return obj;
    }
    case "array": {
      const c = Math.floor(Math.random() * 3) + 1;
      return Array.from({ length: c }, () => generateValue(schema.items || { type: "string" }));
    }
    case "string": return `${schema.title || "value"}_${Math.random().toString(36).slice(2, 7)}`;
    case "integer": return Math.floor(Math.random() *
      ((schema.maximum || 1000) - (schema.minimum || 1))) + (schema.minimum || 1);
    case "number": return Math.round(Math.random() * 1000 * 100) / 100;
    case "boolean": return Math.random() > 0.5;
    case "null": return null;
    default: return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const url = new URL(req.url);
  // path: /mock-server/<mockServerId>/<rest...>
  const parts = url.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("mock-server");
  const mockServerId = idx >= 0 ? parts[idx + 1] : parts[1];
  const apiPath = "/" + parts.slice((idx >= 0 ? idx + 2 : 2)).join("/");
  const method = req.method;
  const start = Date.now();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: mockServer } = await supabase
    .from("mock_servers")
    .select("id, request_count, status, specs(parsed_data)")
    .eq("id", mockServerId)
    .single();

  if (!mockServer || mockServer.status !== "running") {
    return new Response(JSON.stringify({ error: "Mock server not found or stopped" }),
      { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const endpoints = (mockServer as any).specs?.parsed_data?.endpoints || [];
  const matched = endpoints.find((ep: any) => {
    if (ep.method !== method) return false;
    const pattern = "^" + ep.path.replace(/{[^}]+}/g, "[^/]+") + "$";
    return new RegExp(pattern).test(apiPath);
  });

  let body: any = {}; let status = 200;
  if (matched) {
    const okCode = Object.keys(matched.responses || {}).find((c) => c.startsWith("2")) || "200";
    status = parseInt(okCode);
    const schema = matched.responses[okCode]?.content?.["application/json"]?.schema;
    body = schema ? generateValue(schema) : { success: true };
  } else {
    status = 404;
    body = { error: "Endpoint not found in spec", path: apiPath, method };
  }

  const duration = Date.now() - start;
  await Promise.all([
    supabase.from("mock_requests").insert({
      mock_server_id: mockServerId,
      method, path: apiPath, status_code: status,
      duration_ms: duration, response_body: body,
    }),
    supabase.from("mock_servers")
      .update({ request_count: (mockServer.request_count || 0) + 1 })
      .eq("id", mockServerId),
  ]);

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
      "X-Powered-By": "Flowt",
      "X-Response-Time": `${duration}ms`,
      "X-Mock-Server": "true",
    },
  });
});
