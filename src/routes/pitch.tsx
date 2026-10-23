import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { ArrowRight, AlertTriangle, Zap, GitPullRequest, Server, Users, Target, TrendingUp, Rocket, Check } from "lucide-react";

export const Route = createFileRoute("/pitch")({
  head: () => ({
    meta: [
      { title: "Flowt for Investors — API contract testing platform" },
      { name: "description", content: "Why Flowt: the problem, product, market, business model, roadmap and the round." },
      { property: "og:title", content: "Flowt for Investors" },
      { property: "og:description", content: "API contracts that never break production. Problem, product, market and plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pitch,
});

function Block({ n, tag, title, children }: { n: string; tag: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center gap-3 text-[12px] font-mono uppercase tracking-widest text-primary-hover">
          <span>{n}</span><span className="h-px w-8 bg-border" /><span>{tag}</span>
        </div>
        <h2 className="mt-4 max-w-3xl text-[32px] sm:text-[44px] font-bold tracking-tight leading-tight">{title}</h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

function Card({ icon: Icon, t, d }: { icon: any; t: string; d: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <Icon className="h-5 w-5 text-primary-hover" />
      <div className="mt-4 text-[16px] font-semibold">{t}</div>
      <p className="mt-2 text-[14px] leading-6 text-text-secondary">{d}</p>
    </div>
  );
}

const ph = (s: string) => <span className="rounded bg-warning/15 px-1.5 font-mono text-[0.85em] text-warning">[{s}]</span>;

function Pitch() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <header className="relative overflow-hidden pt-36 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <span className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-text-secondary">Investor overview · 2026</span>
          <h1 className="mt-6 max-w-4xl text-[44px] sm:text-[68px] font-bold tracking-tight leading-[1.02]">
            API contracts that <span className="text-gradient">never break production.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-7 text-text-secondary">
            Flowt turns an OpenAPI spec into a live mock server, detects breaking changes between versions, and gives every team one shared source of truth for their APIs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-[14px] font-medium text-primary-foreground hover:bg-primary-hover">Try the live product <ArrowRight className="h-4 w-4" /></Link>
            <a href="/#pricing" className="inline-flex h-11 items-center rounded-lg border border-border bg-surface px-5 text-[14px] hover:border-border-hover">See pricing</a>
          </div>
        </div>
      </header>

      <Block n="01" tag="Problem" title="Frontend and backend teams constantly break each other's code.">
        <div className="grid gap-4 md:grid-cols-3">
          <Card icon={AlertTriangle} t="Silent breaking changes" d="A renamed field or removed endpoint ships unnoticed and breaks mobile and web clients in production." />
          <Card icon={Users} t="Blocked teams" d="Frontend waits weeks for backend endpoints to exist before building anything real." />
          <Card icon={Target} t="Specs drift from reality" d="Documentation goes stale because nothing checks it against the actual contract." />
        </div>
      </Block>

      <Block n="02" tag="Solution" title="Upload a spec. Get a mock server, drift detection and a shared workspace.">
        <div className="grid gap-4 md:grid-cols-3">
          <Card icon={Server} t="Instant mock servers" d="Every endpoint in the spec becomes a live URL returning schema-correct responses." />
          <Card icon={GitPullRequest} t="Drift detection" d="Compare versions and see breaking vs. safe changes before anything is released." />
          <Card icon={Zap} t="Built for teams" d="Workspaces, roles, invitations, API keys and a live request stream." />
        </div>
      </Block>

      <Block n="03" tag="Market" title="Every company that ships an API is a potential customer.">
        <div className="grid gap-4 sm:grid-cols-3">
          {[["TAM", "Total API tooling market"], ["SAM", "API testing & mocking"], ["SOM", "Reachable in 3 years"]].map(([k, l]) => (
            <div key={k} className="rounded-2xl border border-border bg-surface p-6">
              <div className="font-mono text-[12px] text-text-muted">{k}</div>
              <div className="mt-2 text-[28px] font-bold">{ph(`${k} — replace`)}</div>
              <div className="mt-1 text-[13px] text-text-secondary">{l}</div>
            </div>
          ))}
        </div>
      </Block>

      <Block n="04" tag="Business model" title="Self-serve SaaS that grows with the team.">
        <div className="grid gap-4 md:grid-cols-4">
          {[["Free", "$0", "Developer adoption"], ["Pro", "$49/seat", "Growing teams"], ["Team", "$149/seat", "CI/CD, SSO, Slack"], ["Enterprise", "Custom", "Audit logs, SLA, self-host"]].map(([n, p, d]) => (
            <div key={n} className="rounded-2xl border border-border bg-surface p-6">
              <div className="text-[14px] font-semibold">{n}</div>
              <div className="mt-2 text-[26px] font-bold">{p}</div>
              <div className="mt-1 text-[13px] text-text-secondary">{d}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[14px] text-text-secondary">Product-led growth: free developers bring Flowt into their company, teams upgrade for collaboration and CI.</p>
      </Block>

      <Block n="05" tag="Traction" title="Live product, real infrastructure.">
        <ul className="grid gap-3 sm:grid-cols-2 text-[14px] text-text-secondary">
          {["Working product: accounts, workspaces, spec upload, mock servers, drift reports", "Team invitations, roles and API keys", "Live request stream and usage analytics"].map((x) => (
            <li key={x} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{x}</li>
          ))}
          <li className="flex gap-2"><TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary-hover" />Users / revenue: {ph("add real numbers")}</li>
        </ul>
      </Block>

      <Block n="06" tag="Roadmap" title="From mock server to the API reliability platform.">
        <div className="grid gap-4 md:grid-cols-4">
          {[["Now", "Mock servers, drift reports, teams"], ["Next", "GitHub Actions checks, Slack alerts"], ["Later", "SDK generation, GraphQL support"], ["Vision", "Enterprise governance for all APIs"]].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-border bg-surface p-6">
              <Rocket className="h-4 w-4 text-primary-hover" />
              <div className="mt-3 text-[15px] font-semibold">{t}</div>
              <div className="mt-1 text-[13px] text-text-secondary">{d}</div>
            </div>
          ))}
        </div>
      </Block>

      <Block n="07" tag="The ask" title="Raising to scale go-to-market and the product team.">
        <div className="rounded-2xl border border-primary/40 bg-primary/5 p-8">
          <div className="text-[15px]">Round size: {ph("amount — replace")}</div>
          <div className="mt-2 text-[15px]">Use of funds: {ph("e.g. engineering / GTM split — replace")}</div>
          <div className="mt-2 text-[15px]">Founder: Akmal Karimboyev · {ph("contact email — replace")}</div>
        </div>
      </Block>
      <Footer />
    </div>
  );
}
