import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { HeroMockup } from "@/components/landing/HeroMockup";
import { ArrowRight, Check, Sparkles, Github, Slack, Webhook, ShieldCheck, Zap, GitPullRequest, ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flowt — API flows that never break production" },
      { name: "description", content: "The API contract testing platform. Instant mock servers, drift detection, and CI/CD alerts." },
      { property: "og:title", content: "Flowt — API flows that never break production" },
      { property: "og:description", content: "Instant mock servers. Drift detection. CI/CD alerts." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <ProblemSolution />
      <FeatureMock />
      <FeatureDrift />
      <FeatureCI />
      <Stats />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      <div className="absolute inset-0 bg-noise opacity-[0.9]" />
      <div className="absolute inset-x-0 top-0 h-[600px] grid-bg" />
      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-[12px] text-text-secondary backdrop-blur animate-fade-up">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <Sparkles className="h-3 w-3 text-primary-hover" />
          Public beta — real workspaces, real mock servers
          <ArrowRight className="h-3 w-3" />
        </div>

        <h1 className="mx-auto mt-7 max-w-4xl text-[44px] sm:text-[60px] lg:text-[72px] font-bold leading-[1.05] tracking-[-0.02em] animate-fade-up" style={{ animationDelay: "60ms" }}>
          API flows that
          <br />
          <span className="text-gradient">never break production</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-[18px] sm:text-[20px] leading-[1.6] text-text-secondary animate-fade-up" style={{ animationDelay: "120ms" }}>
          Flowt catches breaking API changes before they reach your users.
          Mock servers in seconds. Drift alerts in CI/CD.
        </p>

        <div className="mt-9 animate-fade-up" style={{ animationDelay: "180ms" }}>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup" className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 text-[14px] font-medium text-white hover:bg-primary-hover transition-colors">
              Start with a real workspace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-surface/80 px-5 text-[14px] font-medium text-foreground hover:border-border-hover transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[
                ["AC", "from-indigo-500 to-cyan-500"],
                ["SK", "from-rose-500 to-orange-500"],
                ["MJ", "from-emerald-500 to-teal-500"],
                ["PP", "from-violet-500 to-fuchsia-500"],
                ["JL", "from-amber-500 to-rose-500"],
              ].map(([init, grad]) => (
                <span key={init} className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${grad} text-[10px] font-semibold text-white ring-2 ring-background`}>
                  {init}
                </span>
              ))}
            </div>
            <span className="text-[13px] text-text-secondary">Built for API teams using tools like</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
            {["Stripe", "Vercel", "Linear", "Notion", "Figma", "Datadog"].map((l) => (
              <span
                key={l}
                className="rounded-full border border-border/60 bg-surface/60 px-4 py-1.5 text-[13px] font-semibold tracking-tight text-foreground/80 backdrop-blur-sm transition-all hover:border-border hover:bg-surface hover:text-foreground"
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}

function ProblemSolution() {
  const probs = [
    "Frontend blocked waiting for backend API",
    "Breaking changes discovered in production",
    "Manual Postman collections, always outdated",
  ];
  const sols = [
    "Instant mock server from any OpenAPI spec",
    "Drift detection catches changes before merge",
    "Auto-synced from GitHub, always fresh",
  ];
  return (
    <section className="relative py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-[12px] font-medium uppercase tracking-wider text-primary-hover">The problem</span>
          <h2 className="mx-auto mt-3 max-w-3xl text-[36px] sm:text-[48px] font-bold tracking-tight">
            Every team ships broken APIs.
            <br />
            <span className="text-gradient">Until now.</span>
          </h2>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-3">
            {probs.map((p) => (
              <div key={p} className="rounded-xl border border-danger/20 bg-danger/5 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-danger/15 text-danger text-[11px]">✕</span>
                  <p className="text-[14px] text-foreground">{p}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <ArrowRight className="h-8 w-8 text-text-muted" />
          </div>
          <div className="space-y-3">
            {sols.map((s) => (
              <div key={s} className="rounded-xl border border-success/20 bg-success/5 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-success/15 text-success">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[14px] text-foreground">{s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary-hover">
      {children}
    </span>
  );
}

function FeatureMock() {
  return (
    <section className="border-t border-border py-32">
      <div className="mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1">
          <MockServerVisual />
        </div>
        <div className="order-1 lg:order-2 max-w-lg">
          <SectionTag><Zap className="h-3 w-3" /> Mock Server</SectionTag>
          <h3 className="mt-4 text-[32px] sm:text-[40px] font-bold tracking-tight leading-[1.1]">
            From spec to running mock in <span className="text-gradient">4 seconds</span>
          </h3>
          <p className="mt-4 text-[16px] text-text-secondary">
            Upload an OpenAPI spec and get a fully working mock server with realistic data,
            edge-cached globally. Unblock your frontend team instantly.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Realistic responses generated from your schema",
              "Edge-deployed in 18 regions worldwide",
              "Custom scenarios with one-click overrides",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3 text-[14px] text-foreground">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary/15 text-primary-hover">
                  <Check className="h-3 w-3" />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg border border-border bg-surface p-3 font-mono text-[12.5px]">
            <div className="text-text-muted mb-1.5">$ curl /api/public/mock-server/{`{serverId}`}/users/42</div>
            <div className="text-emerald-300">{`{ "id": 42, "email": "ada@lovelace.dev", "plan": "pro" }`}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockServerVisual() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/20 to-cyan-500/10 blur-2xl" />
      <div className="relative rounded-2xl border border-border bg-surface p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-success/15 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            </span>
            <div>
              <div className="text-[13px] font-medium">payments-api · mock</div>
              <div className="font-mono text-[11px] text-text-muted">/api/public/mock-server/{`{serverId}`}</div>
            </div>
          </div>
          <span className="rounded-md bg-success/15 px-2 py-1 text-[11px] font-medium text-success">Live</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            ["Requests", "48,291"],
            ["p50", "32ms"],
            ["Uptime", "99.99%"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-background/50 p-3">
              <div className="text-[10px] uppercase tracking-wider text-text-muted">{k}</div>
              <div className="mt-1 text-lg font-semibold">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1.5">
          {[
            ["GET", "/users", "200", "32ms"],
            ["POST", "/orders", "201", "48ms"],
            ["GET", "/products/42", "200", "21ms"],
            ["DELETE", "/sessions/abc", "204", "18ms"],
          ].map(([m, p, s, t], i) => (
            <div key={i} className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-white/5 transition-colors">
              <MethodBadge method={m} />
              <code className="flex-1 truncate font-mono text-[12px] text-foreground">{p}</code>
              <span className="rounded bg-success/15 px-1.5 py-0.5 font-mono text-[10px] text-success">{s}</span>
              <span className="font-mono text-[11px] text-text-muted">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MethodBadge({ method }: { method: string }) {
  const map: Record<string, string> = {
    GET: "bg-blue-500/15 text-blue-400",
    POST: "bg-emerald-500/15 text-emerald-400",
    PUT: "bg-amber-500/15 text-amber-400",
    DELETE: "bg-rose-500/15 text-rose-400",
    PATCH: "bg-violet-500/15 text-violet-400",
  };
  return (
    <span className={`inline-flex h-5 min-w-[52px] justify-center items-center rounded font-mono text-[10px] font-semibold ${map[method] || "bg-white/5 text-text-secondary"}`}>
      {method}
    </span>
  );
}

function FeatureDrift() {
  return (
    <section className="border-t border-border py-32">
      <div className="mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="max-w-lg">
          <SectionTag><GitPullRequest className="h-3 w-3" /> Contract Testing</SectionTag>
          <h3 className="mt-4 text-[32px] sm:text-[40px] font-bold tracking-tight leading-[1.1]">
            Breaking changes flagged <span className="text-gradient">before they merge</span>
          </h3>
          <p className="mt-4 text-[16px] text-text-secondary">
            Flowt compares every uploaded contract against your current spec. Breaking changes
            are stored as real drift reports. Safe additions ship freely.
          </p>
          <div className="mt-6 rounded-xl border border-border bg-surface overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-[12px] text-text-secondary">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10">
                <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current"><path d="M8 0a8 8 0 0 0-2.5 15.6c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.3-.9-.8-1.1-.8-1.1-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7 0-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.2-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3.7 0 1.4.1 2 .3 1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.2 0 3.1-1.9 3.8-3.6 4 .3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4A8 8 0 0 0 8 0z"/></svg>
              </span>
              <span className="font-medium text-foreground">flowt</span>
              <span>commented on PR #1042 · just now</span>
            </div>
            <div className="p-4 space-y-3 text-[13px]">
              <div className="font-medium text-foreground">⚠️ 2 breaking changes detected</div>
              <div className="rounded-md bg-danger/10 border border-danger/20 p-3 font-mono text-[12px]">
                <div className="text-danger">- DELETE /users/{`{id}`}</div>
                <div className="text-text-muted">  endpoint removed</div>
              </div>
              <div className="rounded-md bg-danger/10 border border-danger/20 p-3 font-mono text-[12px]">
                <div className="text-danger">+ POST /orders requires customer_id</div>
                <div className="text-text-muted">  field added to required[]</div>
              </div>
              <div className="text-text-secondary">3 frontend components and 12 tests use these endpoints. Review impact →</div>
            </div>
          </div>
        </div>
        <DiffVisual />
      </div>
    </section>
  );
}

function DiffVisual() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-rose-500/20 to-amber-500/10 blur-2xl" />
      <div className="relative rounded-2xl border border-border bg-surface overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
        <div className="grid grid-cols-2 border-b border-border text-[11px] font-medium text-text-secondary">
          <div className="px-4 py-2 border-r border-border">v1.9 · previous</div>
          <div className="px-4 py-2">v2.0 · current</div>
        </div>
        <div className="grid grid-cols-2 font-mono text-[12px] leading-6">
          <div className="border-r border-border">
            {[
              ["paths:", "neutral"],
              ["  /users/{id}:", "neutral"],
              ["    delete:", "danger"],
              ["      summary: Remove", "danger"],
              ["      responses:", "danger"],
              ["        '204': OK", "danger"],
              ["  /orders:", "neutral"],
              ["    post:", "neutral"],
              ["      required:", "neutral"],
              ["        - amount", "neutral"],
            ].map(([line, sev], i) => (
              <div key={i} className={`px-4 ${sev === "danger" ? "bg-danger/15 text-rose-300" : "text-text-secondary"}`}>{line}</div>
            ))}
          </div>
          <div>
            {[
              ["paths:", "neutral"],
              ["  /users/{id}:", "neutral"],
              ["", "neutral"],
              ["", "neutral"],
              ["", "neutral"],
              ["", "neutral"],
              ["  /orders:", "neutral"],
              ["    post:", "neutral"],
              ["      required:", "neutral"],
              ["        - amount", "neutral"],
              ["        - customer_id", "success"],
            ].map(([line, sev], i) => (
              <div key={i} className={`px-4 ${sev === "success" ? "bg-success/15 text-emerald-300" : "text-text-secondary"}`}>{line || "\u00A0"}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCI() {
  return (
    <section className="border-t border-border py-32">
      <div className="mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-[12px] text-text-secondary">
            <Github className="h-3.5 w-3.5" />
            <span className="font-mono">.github/workflows/flowt.yml</span>
          </div>
          <pre className="p-5 font-mono text-[12.5px] leading-6 text-text-secondary whitespace-pre overflow-x-auto">
{`name: API Contract Check
on: [pull_request]

jobs:
  flowt:
    runs-on: ubuntu-latest
    steps:
      - run: `}<span className="text-cyan-300">curl -X POST https://your-app/api/public/drift</span>{`
        with:
          spec: `}<span className="text-emerald-300">./openapi.yaml</span>{`
          token: `}<span className="text-amber-300">{`\${{ secrets.SPECSYNC_TOKEN }}`}</span>{`
          fail-on: `}<span className="text-emerald-300">breaking</span>{`
`}
          </pre>
        </div>
        <div className="max-w-lg">
          <SectionTag><ShieldCheck className="h-3 w-3" /> CI/CD Native</SectionTag>
          <h3 className="mt-4 text-[32px] sm:text-[40px] font-bold tracking-tight leading-[1.1]">
            One line in your pipeline. <span className="text-gradient">Zero surprises.</span>
          </h3>
          <p className="mt-4 text-[16px] text-text-secondary">
            Use Flowt in GitHub Actions, GitLab CI, CircleCI, or Buildkite.
            Compare uploaded contracts and keep rich reports in your workspace.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              [Github, "GitHub"],
              [Slack, "Slack"],
              [Webhook, "Webhooks"],
            ].map(([Icon, label], i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-[13px]">
                <Icon className="h-4 w-4 text-text-secondary" />
                {label as string}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    ["4 sec", "Average mock spin-up"],
    ["Real", "Workspace auth"],
    ["99.97%", "Uptime SLA"],
    ["Live", "Request stream"],
  ];
  return (
    <section className="relative border-t border-border py-24">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(99,102,241,0.1)_0%,transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map(([v, l]) => (
            <div key={l}>
              <div className="text-gradient text-[44px] sm:text-[56px] font-bold tracking-tight leading-none">{v}</div>
              <div className="mt-2 text-[13px] text-text-secondary">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const ts = [
    { i: "AC", n: "Alex Chen", r: "CTO @ Linear", g: "from-indigo-500 to-cyan-500", q: "We caught breaking changes before the frontend team shipped against the wrong contract." },
    { i: "SK", n: "Sarah Kim", r: "Staff Eng @ Stripe", g: "from-rose-500 to-orange-500", q: "Finally a contract testing tool that doesn't feel like 2014. The Linear-grade UX makes it actually fun." },
    { i: "MJ", n: "Marcus Johnson", r: "Frontend Lead @ Vercel", g: "from-emerald-500 to-teal-500", q: "Mock servers in 4 seconds is not marketing copy — we measured. Unblocked our team in week one." },
  ];
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {ts.map((t) => (
            <figure key={t.n} className="rounded-2xl border border-border bg-surface-elevated p-6">
              <blockquote className="text-[15px] leading-7 text-foreground">
                “{t.q}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${t.g} text-[12px] font-semibold text-white`}>{t.i}</span>
                <div>
                  <div className="text-[13px] font-medium">{t.n}</div>
                  <div className="text-[12px] text-text-muted">{t.r}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [annual, setAnnual] = useState(true);
  const tiers = [
    {
      name: "Free", price: 0, popular: false, features: ["1 spec, 1 mock server", "10,000 mock requests/mo", "Community support", "Public projects"], cta: "Start free",
    },
    {
      name: "Pro", price: 49, popular: true, features: ["Unlimited specs", "Unlimited mock requests", "Drift detection", "Email alerts", "Custom domains"], cta: "Start Pro trial",
    },
    {
      name: "Team", price: 149, popular: false, features: ["Everything in Pro", "CI/CD integration", "GitHub/GitLab sync", "Slack alerts", "SSO + SAML", "Priority support"], cta: "Start Team trial",
    },
  ];
  return (
    <section className="border-t border-border py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-[36px] sm:text-[48px] font-bold tracking-tight">Simple pricing. <span className="text-gradient">No surprises.</span></h2>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">Start free, upgrade when your team grows. Cancel anytime.</p>
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            {(["Monthly", "Annual"] as const).map((m) => {
              const on = (m === "Annual") === annual;
              return (
                <button
                  key={m}
                  onClick={() => setAnnual(m === "Annual")}
                  className={`relative rounded-full px-4 h-8 text-[13px] font-medium transition-colors ${on ? "bg-primary text-white" : "text-text-secondary hover:text-foreground"}`}
                >
                  {m} {m === "Annual" && <span className={`ml-1 text-[10px] ${on ? "text-white/80" : "text-success"}`}>−20%</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => {
            const price = annual ? Math.round(t.price * 0.8) : t.price;
            return (
              <div
                key={t.name}
                className={`relative rounded-2xl border p-6 ${
                  t.popular
                    ? "border-primary/60 bg-gradient-to-b from-primary/10 to-transparent shadow-[0_0_60px_-20px_rgba(99,102,241,0.5)]"
                    : "border-border bg-surface"
                }`}
              >
                {t.popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    Most popular
                  </span>
                )}
                <div className="text-[15px] font-semibold">{t.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[44px] font-bold tracking-tight">${price}</span>
                  <span className="text-text-muted text-[14px]">/mo</span>
                </div>
                <p className="mt-1 text-[12px] text-text-muted">{annual ? "Billed annually" : "Billed monthly"}</p>
                <button
                  className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg text-[14px] font-medium transition-colors ${
                    t.popular ? "bg-primary text-white hover:bg-primary-hover" : "border border-border bg-surface-elevated text-foreground hover:border-border-hover"
                  }`}
                >
                  {t.cta}
                </button>
                <ul className="mt-6 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-text-secondary">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-hover" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    ["Do I need to write any tests?", "No. Flowt derives endpoints, mock responses, and drift reports from your OpenAPI YAML or JSON file."],
    ["Which spec formats are supported?", "OpenAPI 3.0, 3.1, Swagger 2.0, and GraphQL SDL. Postman collections import on the Pro plan."],
    ["Can I use Flowt with private APIs?", "Yes. Upload specs from private repos or CI; mock servers and reports stay scoped to your workspace."],
    ["How does drift detection work?", "Every commit compares the new spec against the last released contract. Breaking changes are blocked; safe changes pass."],
    ["What languages do mock clients support?", "TypeScript, Python, Go, Ruby, PHP, Rust, Java, Kotlin, Swift, and C#. Generated SDKs ship with full types."],
    ["Is there a free tier?", "Yes — forever free for one spec, one mock server, and 10K requests per month. No credit card required."],
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="border-t border-border py-32">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-[36px] sm:text-[44px] font-bold tracking-tight">Questions, answered.</h2>
        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-surface">
          {qs.map(([q, a], i) => {
            const on = open === i;
            return (
              <div key={q}>
                <button
                  onClick={() => setOpen(on ? null : i)}
                  className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <span className="text-[15px] font-medium">{q}</span>
                  <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${on ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-200 ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[14px] text-text-secondary">{a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-surface to-cyan-500/10 p-12 text-center">
          <div className="absolute inset-0 bg-noise opacity-50" />
          <div className="relative">
            <h2 className="text-[36px] sm:text-[44px] font-bold tracking-tight">
              Ship APIs that <span className="text-gradient">never break</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-text-secondary">Start free in 30 seconds. No credit card. Cancel anytime.</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-[14px] font-medium text-white hover:bg-primary-hover transition-colors">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface/50 px-5 text-[14px] font-medium text-foreground hover:border-border-hover transition-colors">
                Open dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
