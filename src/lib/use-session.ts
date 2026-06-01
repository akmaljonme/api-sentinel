import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type ProfileRow = {
  id: string;
  org_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "owner" | "admin" | "member" | "viewer";
};

export type OrgRow = {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "team";
};

const workspacePromises = new Map<string, Promise<ProfileRow>>();

async function ensureUserWorkspace(user: User, existing: ProfileRow | null) {
  const displayName =
    user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const orgId = crypto.randomUUID();
  const slugBase = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "workspace";

  const { error: orgError } = await supabase.from("organizations").insert({
    id: orgId,
    name: `${displayName}'s workspace`,
    slug: `${slugBase}-${user.id.slice(0, 8)}`,
  });
  if (orgError) throw orgError;

  if (existing) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ org_id: orgId, full_name: existing.full_name || displayName, role: existing.role || "owner" })
      .eq("id", user.id)
      .select("id, org_id, full_name, avatar_url, role")
      .single();
    if (error) throw error;
    return data as ProfileRow;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: user.id, org_id: orgId, full_name: displayName, role: "owner" })
    .select("id, org_id, full_name, avatar_url, role")
    .single();
  if (error) throw error;
  return data as ProfileRow;
}

function getOrCreateWorkspace(user: User, existing: ProfileRow | null) {
  const current = workspacePromises.get(user.id);
  if (current) return current;
  const promise = ensureUserWorkspace(user, existing).finally(() => workspacePromises.delete(user.id));
  workspacePromises.set(user.id, promise);
  return promise;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [org, setOrg] = useState<OrgRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setLoading(!!s);
      setSession(s);
      setUser(s?.user ?? null);
      if (!s) {
        setProfile(null);
        setOrg(null);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (!data.session) setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let { data: p, error: profileError } = await supabase
          .from("profiles")
          .select("id, org_id, full_name, avatar_url, role")
          .eq("id", user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (!p?.org_id) {
          p = await getOrCreateWorkspace(user, p as ProfileRow | null);
        }
        if (cancelled) return;
        setProfile(p as ProfileRow | null);
        if (p?.org_id) {
          const { data: o, error: orgError } = await supabase
            .from("organizations")
            .select("id, name, slug, plan")
            .eq("id", p.org_id)
            .maybeSingle();
          if (orgError) throw orgError;
          if (!cancelled) setOrg(o as OrgRow | null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  return { session, user, profile, org, loading };
}
