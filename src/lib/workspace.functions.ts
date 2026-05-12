import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const inputSchema = z.object({
  email: z.string().email().optional().nullable(),
  fullName: z.string().trim().min(1).max(120).optional().nullable(),
});

export const ensureWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const displayName =
      data.fullName || data.email?.split("@")[0] || `User ${userId.slice(0, 8)}`;

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("profiles")
      .select("id, org_id, full_name, avatar_url, role")
      .eq("id", userId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing?.org_id) return existing;

    const slugBase = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "workspace";

    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: `${displayName}'s workspace`,
        slug: `${slugBase}-${userId.slice(0, 8)}`,
      })
      .select("id")
      .single();

    if (orgError) throw orgError;

    if (existing) {
      const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .update({ org_id: org.id, full_name: existing.full_name || displayName, role: existing.role || "owner" })
        .eq("id", userId)
        .select("id, org_id, full_name, avatar_url, role")
        .single();
      if (error) throw error;
      return profile;
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .insert({ id: userId, org_id: org.id, full_name: displayName, role: "owner" })
      .select("id, org_id, full_name, avatar_url, role")
      .single();

    if (error) throw error;
    return profile;
  });