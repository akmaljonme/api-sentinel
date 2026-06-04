import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signUpWithEmail } from "@/lib/auth";
import { AuthShell, Field } from "./login";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Flowt" }, { name: "description", content: "Create your Flowt account." }] }),
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
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    setBusy(true);
    try {
      await signUpWithEmail(email, password, name);
      toast.success("Account created — welcome to Flowt!");
      nav({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Could not create account");
    } finally { setBusy(false); }
  }

  return <AuthShell title="Create your workspace" subtitle="Always free for one spec. No credit card required." footer={
    <>Already have an account? <Link to="/login" className="text-primary-hover hover:underline">Sign in</Link></>
  }>
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="Full name" type="text" value={name} onChange={setName} autoComplete="name" required />
      <Field label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" required />
      <Field label="Password (min. 8 characters)" type="password" value={password} onChange={setPassword} autoComplete="new-password" required />
      <button disabled={busy} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-[14px] font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition-colors">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
      </button>
    </form>
    <p className="text-center text-[11px] text-text-muted">By signing up, you agree to the Terms of Service and Privacy Policy.</p>
  </AuthShell>;
}
