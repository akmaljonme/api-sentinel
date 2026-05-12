import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { ensureWorkspace } from "./workspace.functions";

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

export function useSession() {
  const ensureWorkspaceFn = useServerFn(ensureWorkspace);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [org, setOrg] = useState<OrgRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s) {
        setProfile(null);
        setOrg(null);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      let { data: p } = await supabase
        .from("profiles")
        .select("id, org_id, full_name, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();
      if (!p?.org_id) {
        p = await ensureWorkspaceFn({
          data: {
            email: user.email,
            fullName: user.user_metadata?.full_name || user.user_metadata?.name,
          },
        });
      }
      if (cancelled) return;
      setProfile(p as ProfileRow | null);
      if (p?.org_id) {
        const { data: o } = await supabase
          .from("organizations")
          .select("id, name, slug, plan")
          .eq("id", p.org_id)
          .maybeSingle();
        if (!cancelled) setOrg(o as OrgRow | null);
      }
    })();
    return () => { cancelled = true; };
  }, [ensureWorkspaceFn, user]);

  return { session, user, profile, org, loading };
}
