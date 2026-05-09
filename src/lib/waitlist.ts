import { supabase } from "@/integrations/supabase/client";

export async function joinWaitlist(email: string): Promise<{ ok: boolean; message: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  const { error } = await supabase.from("waitlist").insert({ email: trimmed });
  if (error) {
    if (error.code === "23505") return { ok: true, message: "You're already on the list — we'll be in touch." };
    return { ok: false, message: "Something went wrong. Try again in a moment." };
  }
  return { ok: true, message: "You're in! We'll be in touch soon." };
}
