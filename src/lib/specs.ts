import { supabase } from "@/integrations/supabase/client";

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
  const name = file.name;

  const { data: spec, error } = await supabase
    .from("specs")
    .insert({ org_id: orgId, content, name })
    .select()
    .single();
  if (error) throw error;

  const { data: parsed, error: parseErr } = await supabase.functions.invoke("parse-spec", {
    body: { spec_id: spec.id },
  });
  if (parseErr) throw parseErr;

  await supabase.from("mock_servers").insert({
    spec_id: spec.id,
    org_id: orgId,
    status: "running",
  });

  return { spec, parsed_data: parsed?.parsed_data };
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
  const { data: spec } = await supabase.from("specs").select("content").eq("id", specId).single();
  const { data, error } = await supabase.functions.invoke("detect-drift", {
    body: { spec_id: specId, old_content: spec?.content, new_content: newContent },
  });
  if (error) throw error;
  await supabase.from("specs")
    .update({ content: newContent, updated_at: new Date().toISOString() })
    .eq("id", specId);
  // Re-parse new content
  await supabase.functions.invoke("parse-spec", { body: { spec_id: specId } });
  return data;
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
