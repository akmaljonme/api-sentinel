import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signUpWithEmail } from "@/lib/auth";
import { AuthShell, Field } from "./login";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Hisob yaratish — Flowt" }, { name: "description", content: "Flowt hisobingizni yarating." }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
    setBusy(true);
    try {
      await signUpWithEmail(email, password, name);
      toast.success("Hisob yaratildi — Flowtga xush kelibsiz!");
      nav({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Hisob yaratib bo'lmadi");
    } finally { setBusy(false); }
  }

  return <AuthShell title="Ish joyingizni yarating" subtitle="Bitta spec uchun doimo bepul. Kredit karta shart emas." footer={
    <>Hisobingiz bormi? <Link to="/login" className="text-primary-hover hover:underline">Kirish</Link></>
  }>
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="To'liq ism" type="text" value={name} onChange={setName} autoComplete="name" required />
      <Field label="Elektron pochta" type="email" value={email} onChange={setEmail} autoComplete="email" required />
      <Field label="Parol (kamida 8 ta belgi)" type="password" value={password} onChange={setPassword} autoComplete="new-password" required />
      <button disabled={busy} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-[14px] font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition-colors">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Hisob yaratish
      </button>
    </form>
    <p className="text-center text-[11px] text-text-muted">Ro'yxatdan o'tish orqali siz Foydalanish shartlari va Maxfiylik siyosatiga rozilik bildirasiz.</p>
  </AuthShell>;
}
