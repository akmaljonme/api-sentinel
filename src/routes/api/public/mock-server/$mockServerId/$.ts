import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateValue } from "@/lib/openapi";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
};

export const Route = createFileRoute("/api/public/mock-server/$mockServerId/$")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      GET: handleMockRequest,
      POST: handleMockRequest,
      PUT: handleMockRequest,
      PATCH: handleMockRequest,
      DELETE: handleMockRequest,
      HEAD: handleMockRequest,
    },
  },
});

async function handleMockRequest({ request, params }: { request: Request; params: { mockServerId: string; _splat?: string } }) {
  const startedAt = Date.now();
  const method = request.method.toUpperCase();
  const apiPath = `/${(params._splat || "").replace(/^\/+/, "")}`;

  const { data: mockServer, error } = await supabaseAdmin
    .from("mock_servers")
    .select("id, request_count, status, specs(parsed_data)")
    .eq("id", params.mockServerId)
    .maybeSingle();

  if (error || !mockServer || mockServer.status !== "running") {
    return jsonResponse({ error: "Mock server not found or stopped" }, 404, startedAt);
  }

  const endpoints = ((mockServer as any).specs?.parsed_data?.endpoints || []) as any[];
  const matched = endpoints.find((endpoint) => {
    if (endpoint.method !== method) return false;
    const pattern = `^${String(endpoint.path).replace(/\{[^}]+\}/g, "[^/"]+")}$`;
    return new RegExp(pattern).test(apiPath);
  });

  let status = 200;
  let body: any = { ok: true };
  if (matched) {
    const okCode = Object.keys(matched.responses || {}).find((code) => code.startsWith("2")) || "200";
    status = Number.parseInt(okCode, 10) || 200;
    const schema = matched.responses?.[okCode]?.content?.["application/json"]?.schema;
    body = schema ? generateValue(schema) : { success: true };
  } else {
    status = 404;
    body = { error: "Endpoint not found in spec", path: apiPath, method };
  }

  const duration = Date.now() - startedAt;
  await Promise.all([
    supabaseAdmin.from("mock_requests").insert({
      mock_server_id: params.mockServerId,
      method,
      path: apiPath,
      status_code: status,
      duration_ms: duration,
      response_body: body,
    }),
    supabaseAdmin
      .from("mock_servers")
      .update({ request_count: ((mockServer as any).request_count || 0) + 1 })
      .eq("id", params.mockServerId),
  ]);

  if (method === "HEAD") {
    return new Response(null, { status, headers: responseHeaders(duration) });
  }
  return jsonResponse(body, status, startedAt);
}

function responseHeaders(duration: number) {
  return {
    ...corsHeaders,
    "Content-Type": "application/json",
    "X-Powered-By": "Flowt",
    "X-Response-Time": `${duration}ms`,
    "X-Mock-Server": "true",
  };
}

function jsonResponse(body: unknown, status: number, startedAt: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(Date.now() - startedAt),
  });
}
