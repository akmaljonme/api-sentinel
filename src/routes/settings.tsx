import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { useSession } from "@/lib/use-session";
import { useEffect, useState } from "react";
import {
  getTeamMembers, getInvitations, inviteMember, revokeInvite,
  getApiKeys, createApiKey, deleteApiKey, updateOrg,
} from "@/lib/team";
import { Building2, Users, KeyRound, CreditCard, Plus, Trash2, Copy, Check, Loader2, Mail, Crown, Shield } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Flowt" }] }),
  component: () => (
    <DashboardLayout crumbs={["Settings"]} action={false}>
      <SettingsPage />
    </DashboardLayout>
  ),
});

const tabs = [
  { id: "general", label: "General", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "keys", label: "API Keys", icon: KeyRound },
  { id: "billing", label: "Billing", icon: CreditCard },
] as const;

function SettingsPage() {
  const [tab, setTab] = useState<typeof tabs[number]["id"]>("general");

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-[13px] text-text-secondary">Manage your workspace, team, and access.</p>
      </div>
      <div className="flex gap-8">
        <nav className="w-48 shrink-0 space-y-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 h-9 text-[13px] transition-colors ${
                tab === t.id ? "bg-primary/15 text-foreground shadow-[inset_0_0_0_1px_rgba(99,102,241,0.25)]"
                  : "text-text-secondary hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <t.icon className={`h-4 w-4 ${tab === t.id ? "text-primary-hover" : ""}`} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="flex-1 min-w-0">
          {tab === "general" && <GeneralTab />}
          {tab === "team" && <TeamTab />}
          {tab === "keys" && <KeysTab />}
          {tab === "billing" && <BillingTab />}
        </div>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: any) {
  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <div className="text-[14px] font-semibold">{title}</div>
        {desc && <p className="mt-0.5 text-[12.5px] text-text-secondary">{desc}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function GeneralTab() {
  const { org, profile, user } = useSession();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setName(org?.name || ""); }, [org?.name]);

  async function save() {
    if (!org?.id) return;
    setBusy(true);
    try { await updateOrg(org.id, { name }); toast.success("Workspace updated"); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <Section title="Workspace" desc="The public name shown to your team.">
        <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Name</label>
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="mt-3 text-[11px] text-text-muted font-mono">slug: {org?.slug}</div>
        <button onClick={save} disabled={busy || !name || name === org?.name}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-[13px] font-medium text-white hover:bg-primary-hover disabled:opacity-50">
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save changes
        </button>
      </Section>

      <Section title="Account">
        <dl className="divide-y divide-border text-[13px]">
          <div className="flex justify-between py-2.5"><dt className="text-text-secondary">Email address</dt><dd className="font-mono">{user?.email}</dd></div>
          <div className="flex justify-between py-2.5"><dt className="text-text-secondary">Display name</dt><dd>{profile?.full_name || "—"}</dd></div>
          <div className="flex justify-between py-2.5"><dt className="text-text-secondary">Role</dt>
            <dd className="inline-flex items-center gap-1.5">
              {profile?.role === "owner" ? <Crown className="h-3 w-3 text-amber-400" /> : <Shield className="h-3 w-3 text-primary-hover" />}
              {profile?.role}
            </dd>
          </div>
        </dl>
      </Section>
    </div>
  );
}

function TeamTab() {
  const { org } = useSession();
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!org?.id) return;
    const [m, i] = await Promise.all([getTeamMembers(org.id), getInvitations(org.id)]);
    setMembers(m); setInvites(i);
  }
  useEffect(() => { load(); }, [org?.id]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!org?.id || !email) return;
    setBusy(true);
    try {
      await inviteMember(org.id, email);
      toast.success(`Invitation sent to ${email}`);
      setEmail(""); load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  async function revoke(id: string) {
    await revokeInvite(id); load(); toast.success("Invitation revoked");
  }

  return (
    <div className="space-y-6">
      <Section title="Invite team members" desc="They will have access to all specs in this workspace.">
        <form onSubmit={invite} className="flex gap-2">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@company.com"
            className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-white hover:bg-primary-hover disabled:opacity-50">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />} Send invitation
          </button>
        </form>
      </Section>

      <Section title="Members" desc={`${members.length} active`}>
        <ul className="divide-y divide-border">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-[11px] font-semibold">
                {(m.full_name || "?").split(" ").map((s: string) => s[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">{m.full_name || "Unnamed"}</div>
                <div className="text-[11px] text-text-muted">Joined {new Date(m.created_at).toLocaleDateString()}</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium capitalize">
                {m.role === "owner" && <Crown className="h-3 w-3 text-amber-400" />} {m.role}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {invites.length > 0 && (
        <Section title="Pending invites">
          <ul className="divide-y divide-border">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-2.5">
                <Mail className="h-4 w-4 text-text-muted" />
                <span className="flex-1 text-[13px] font-mono truncate">{i.email}</span>
                <span className="text-[11px] text-text-muted">{new Date(i.created_at).toLocaleDateString()}</span>
                <button onClick={() => revoke(i.id)} className="text-text-muted hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function KeysTab() {
  const { org } = useSession();
  const [keys, setKeys] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<{ id: string; key: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    if (!org?.id) return;
    setKeys(await getApiKeys(org.id));
  }
  useEffect(() => { load(); }, [org?.id]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!org?.id || !name) return;
    setCreating(true);
    try {
      const k = await createApiKey(org.id, name);
      setRevealed({ id: k.id, key: k.fullKey });
      setName(""); load();
    } catch (e: any) { toast.error(e.message); } finally { setCreating(false); }
  }

  async function copy() {
    if (!revealed) return;
    await navigator.clipboard.writeText(revealed.key);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <Section title="Create API key" desc="Use these keys to call the Flowt CI/CD API.">
        <form onSubmit={create} className="flex gap-2">
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder='e.g. "GitHub Actions — production"'
            className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button disabled={creating || !name} className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-white hover:bg-primary-hover disabled:opacity-50">
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Create
          </button>
        </form>

        {revealed && (
          <div className="mt-4 rounded-lg border border-success/30 bg-success/5 p-4">
            <div className="text-[12px] font-medium text-success mb-1.5">✓ Key created — copy now, it won't be shown again</div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-mono text-[12px]">
              <code className="flex-1 truncate">{revealed.key}</code>
              <button onClick={copy} className="grid h-7 w-7 place-items-center rounded text-text-secondary hover:bg-white/5">
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        )}
      </Section>

      <Section title="Active keys" desc={`${keys.length} keys`}>
        {keys.length === 0 ? (
          <div className="py-6 text-center text-[12.5px] text-text-muted">No API keys yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {keys.map((k) => (
              <li key={k.id} className="flex items-center gap-3 py-3">
                <KeyRound className="h-4 w-4 text-text-muted" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{k.name}</div>
                  <div className="font-mono text-[11px] text-text-muted">{k.key_preview} · created {new Date(k.created_at).toLocaleDateString()}</div>
                </div>
                <button onClick={() => deleteApiKey(k.id).then(load).then(() => toast.success("Key revoked"))}
                  className="text-text-muted hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function BillingTab() {
  const { org } = useSession();
  const plan = org?.plan || "free";

  const plans = [
    { id: "free", name: "Free", price: "$0", desc: "1 spec · 10k requests/mo", features: ["1 spec", "10k mock requests / mo", "Drift detection", "Email support"] },
    { id: "pro", name: "Pro", price: "$29", desc: "Up to 25 specs", features: ["25 specs", "Unlimited mock requests", "Live drift alerts", "GitHub Actions integration", "Priority support"], popular: true },
    { id: "team", name: "Team", price: "$99", desc: "Unlimited specs + SSO", features: ["Unlimited specs", "SAML SSO", "Audit logs", "Custom storage", "Dedicated support"] },
  ];

  return (
    <div className="space-y-6">
      <Section title="Current plan">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[20px] font-semibold capitalize">{plan}</div>
            <div className="text-[12.5px] text-text-secondary mt-0.5">Renews monthly · next billing in 28 days</div>
          </div>
          <span className="rounded-md bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success uppercase">Active</span>
        </div>
      </Section>

      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((p) => {
          const current = p.id === plan;
          return (
            <div key={p.id} className={`relative rounded-xl border p-5 ${
              p.popular ? "border-primary/40 bg-primary/5" : "border-border bg-surface"
            }`}>
              {p.popular && (
                <span className="absolute -top-2 left-5 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">POPULAR</span>
              )}
              <div className="text-[14px] font-semibold">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[28px] font-bold">{p.price}</span>
                <span className="text-[12px] text-text-muted">/ mo</span>
              </div>
              <p className="mt-1 text-[12px] text-text-secondary">{p.desc}</p>
              <ul className="mt-4 space-y-1.5 text-[12.5px] text-text-secondary">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-3 w-3 text-success shrink-0" />{f}</li>
                ))}
              </ul>
              <button disabled={current}
                onClick={() => toast.info("To enable billing, connect Lovable Cloud → Payments")}
                className={`mt-5 w-full inline-flex h-9 items-center justify-center rounded-md text-[13px] font-medium transition-colors ${
                  current ? "bg-white/5 text-text-muted cursor-default"
                          : p.popular ? "bg-primary text-white hover:bg-primary-hover"
                                      : "border border-border text-foreground hover:bg-white/5"
                }`}>
                {current ? "Current plan" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-text-muted text-center">Billing is not yet enabled · contact the owner to upgrade</p>
    </div>
  );
}
