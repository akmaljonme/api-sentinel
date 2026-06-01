import { supabase } from "@/integrations/supabase/client";
import { compareOpenApiSpecs, parseOpenApiSpec } from "@/lib/openapi";

export type Spec = {
  id: string;
  org_id: string;
  name: string;
  version: string | null;
  content: string;
  parsed_data: any;
  endpoint_count: number;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
};

export async function uploadSpec(file: File | { name: string; content: string }, orgId: string) {
  const content = "content" in file ? file.content : await file.text();
  const parsed_data = parseOpenApiSpec(content);
  const name = parsed_data.title || file.name;

  const { data: spec, error } = await supabase
    .from("specs")
    .insert({
      org_id: orgId,
      content,
      name,
      parsed_data,
      version: parsed_data.version,
      endpoint_count: parsed_data.endpoints.length,
    })
    .select()
    .single();
  if (error) throw error;

  await supabase.from("mock_servers").insert({
    spec_id: spec.id,
    org_id: orgId,
    status: "running",
  });

  return { spec, parsed_data };
}

export async function getSpecs(orgId: string) {
  const { data, error } = await supabase
    .from("specs")
    .select("*, mock_servers(id, status, request_count), drift_reports(id, breaking_count, created_at)")
    .eq("org_id", orgId)
    .eq("status", "active")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getSpec(specId: string) {
  const { data, error } = await supabase
    .from("specs")
    .select("*, mock_servers(*)")
    .eq("id", specId)
    .single();
  if (error) throw error;
  return data;
}

export async function runDriftCheck(specId: string, newContent: string) {
  const { data: spec, error: specError } = await supabase
    .from("specs")
    .select("content")
    .eq("id", specId)
    .single();
  if (specError) throw specError;

  const result = compareOpenApiSpecs(spec.content, newContent);
  const { data: report, error: reportError } = await supabase.from("drift_reports").insert({
    spec_id: specId,
    old_version: result.oldVersion,
    new_version: result.newVersion,
    old_content: spec.content,
    new_content: newContent,
    breaking_count: result.breaking,
    warning_count: result.warnings,
    info_count: result.info,
    changes: result.changes,
  }).select().single();
  if (reportError) throw reportError;

  const { error: updateError } = await supabase.from("specs")
    .update({
      content: newContent,
      parsed_data: result.parsedData,
      version: result.newVersion,
      name: result.parsedData.title,
      endpoint_count: result.parsedData.endpoints.length,
      updated_at: new Date().toISOString(),
    })
    .eq("id", specId);
  if (updateError) throw updateError;
  return { report, changes: result.changes, breaking: result.breaking, warnings: result.warnings, info: result.info };
}

export async function getDriftReports(specId: string) {
  const { data, error } = await supabase
    .from("drift_reports")
    .select("*")
    .eq("spec_id", specId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getDashboardMetrics(orgId: string) {
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString();

  const [{ count: specCount }, { data: specIds }] = await Promise.all([
    supabase.from("specs").select("id", { count: "exact", head: true })
      .eq("org_id", orgId).eq("status", "active"),
    supabase.from("specs").select("id").eq("org_id", orgId),
  ]);

  const sids = (specIds || []).map((s) => s.id);

  const { data: mockServerIds } = await supabase
    .from("mock_servers").select("id").eq("org_id", orgId);
  const msIds = (mockServerIds || []).map((m) => m.id);

  let mockRequestsToday = 0;
  if (msIds.length) {
    const { count } = await supabase
      .from("mock_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", yesterday)
      .in("mock_server_id", msIds);
    mockRequestsToday = count || 0;
  }

  let breakingThisWeek = 0;
  let recentActivity: any[] = [];
  if (sids.length) {
    const [{ data: drifts }, { data: recent }] = await Promise.all([
      supabase.from("drift_reports").select("breaking_count, warning_count")
        .gte("created_at", lastWeek).in("spec_id", sids),
      supabase.from("drift_reports")
        .select("id, breaking_count, warning_count, info_count, created_at, specs(name)")
        .in("spec_id", sids)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    breakingThisWeek = (drifts || []).reduce((s, r: any) => s + (r.breaking_count || 0), 0);
    recentActivity = recent || [];
  }

  return {
    specCount: specCount || 0,
    mockRequestsToday,
    breakingAlertsThisWeek: breakingThisWeek,
    recentActivity,
  };
}
