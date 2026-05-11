import { supabase } from "@/integrations/supabase/client";

export async function getTeamMembers(orgId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getInvitations(orgId: string) {
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("org_id", orgId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function inviteMember(orgId: string, email: string, role = "member") {
  const { data, error } = await supabase
    .from("invitations")
    .insert({ org_id: orgId, email, role })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function revokeInvite(id: string) {
  const { error } = await supabase.from("invitations").delete().eq("id", id);
  if (error) throw error;
}

// API keys
function randomKey() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return "flowt_sk_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getApiKeys(orgId: string) {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createApiKey(orgId: string, name: string) {
  const key = randomKey();
  const key_hash = await sha256(key);
  const key_preview = key.slice(0, 12) + "…" + key.slice(-4);
  const { data, error } = await supabase
    .from("api_keys")
    .insert({ org_id: orgId, name, key_hash, key_preview })
    .select()
    .single();
  if (error) throw error;
  return { ...data, fullKey: key };
}

export async function deleteApiKey(id: string) {
  const { error } = await supabase.from("api_keys").delete().eq("id", id);
  if (error) throw error;
}

export async function updateOrg(orgId: string, patch: { name?: string }) {
  const { error } = await supabase.from("organizations").update(patch).eq("id", orgId);
  if (error) throw error;
}

export async function getMockRequestsByDay(orgId: string, days = 7) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data: ms } = await supabase.from("mock_servers").select("id").eq("org_id", orgId);
  const ids = (ms || []).map((m) => m.id);
  if (!ids.length) return Array.from({ length: days }, (_, i) => ({ d: i, count: 0 }));
  const { data } = await supabase
    .from("mock_requests")
    .select("created_at")
    .in("mock_server_id", ids)
    .gte("created_at", since)
    .limit(10000);
  const buckets = new Array(days).fill(0);
  const now = Date.now();
  for (const r of data || []) {
    if (!r.created_at) continue;
    const ageDays = Math.floor((now - +new Date(r.created_at)) / 86400000);
    const idx = days - 1 - ageDays;
    if (idx >= 0 && idx < days) buckets[idx]++;
  }
  return buckets.map((count, d) => ({ d, count }));
}
