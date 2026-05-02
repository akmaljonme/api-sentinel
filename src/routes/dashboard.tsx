import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { FileCode2, Activity, AlertTriangle, ShieldCheck, Upload, Github, UserPlus, BookOpen, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SpecSync" }, { name: "description", content: "API spec overview and recent activity." }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <DashboardLayout crumbs={["Dashboard", "Overview"]}>
      <div className="mx-auto max-w-7xl p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Welcome back, Alex</h1>
          <p className="mt-1 text-[13px] text-text-secondary">Here's what's happening across your APIs today.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={FileCode2} label="Active specs" value="12" delta="+2 this week" tone="primary" />
          <Stat icon={Activity} label="Mock requests today" value="48,291" delta="+18% vs yesterday" tone="success" />
          <Stat icon={AlertTriangle} label="Drift alerts (7d)" value="7" delta="3 breaking" tone="danger" />
          <Stat icon={ShieldCheck} label="Uptime" value="99.97%" delta="30-day avg" tone="success" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <ActivityFeed />
          <QuickActions />
        </div>

        <SpecsTable />
      </div>
    </DashboardLayout>
  );
}

function Stat({ icon: Icon, label, value, delta, tone }: any) {
  const toneMap: Record<string, string> = {
    primary: "text-primary-hover bg-primary/15",
    success: "text-success bg-success/15",
    danger: "text-danger bg-danger/15",
  };
  return (
    <div className="rounded-xl border border-border bg-surface p-4 hover:border-border-hover transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-text-secondary">{label}</span>
        <span className={`grid h-7 w-7 place-items-center rounded-md ${toneMap[tone]}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-3 text-[28px] font-semibold tracking-tight leading-none">{value}</div>
      <div className="mt-2 text-[11px] text-text-muted">{delta}</div>
    </div>
  );
}

function ActivityFeed() {
  const events = [
    { tone: "danger", t: "Breaking change", d: "DELETE /users/{id} removed in payments-api", when: "2 min ago" },
    { tone: "warning", t: "Warning", d: "New required field in POST /orders → customer_id", when: "1 hr ago" },
    { tone: "success", t: "Spec updated", d: "payments-api v2.3.1 published by Sarah Kim", when: "3 hr ago" },
    { tone: "info", t: "Mock server restarted", d: "auth-service · region us-east-1", when: "5 hr ago" },
    { tone: "success", t: "PR check passed", d: "orders-api · #1287 — no breaking changes", when: "8 hr ago" },
    { tone: "info", t: "GitHub sync", d: "inventory-api auto-imported from main", when: "yesterday" },
  ];
  const map: Record<string, string> = { danger: "bg-danger", warning: "bg-warning", success: "bg-success", info: "bg-blue-500" };
  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="text-[14px] font-semibold">Recent activity</div>
        <button className="text-[12px] text-text-secondary hover:text-foreground">View all</button>
      </div>
      <ol className="relative px-5 py-4">
        <span className="absolute left-[26px] top-6 bottom-6 w-px bg-border" />
        {events.map((e, i) => (
          <li key={i} className="relative flex items-start gap-4 py-3">
            <span className={`relative z-10 mt-1.5 grid h-3 w-3 place-items-center rounded-full ring-4 ring-surface ${map[e.tone]}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium">{e.t}</span>
                <span className="text-[11px] text-text-muted">{e.when}</span>
              </div>
              <div className="mt-0.5 truncate text-[12.5px] text-text-secondary">{e.d}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-border bg-surface/40 p-6 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer">
        <span className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary-hover">
          <Upload className="h-5 w-5" />
        </span>
        <div className="mt-3 text-[14px] font-medium">Upload new spec</div>
        <div className="mt-1 text-[12px] text-text-muted">Drop OpenAPI 3.x, Swagger, or GraphQL SDL</div>
      </div>
      <div className="rounded-xl border border-border bg-surface divide-y divide-border">
        {[
          [Github, "Connect GitHub repo", "Auto-sync specs on push"],
          [UserPlus, "Invite teammate", "Free up to 5 seats"],
          [BookOpen, "View CI/CD setup guide", "GitHub, GitLab, CircleCI"],
        ].map(([Icon, t, d], i) => (
          <button key={i} className="group flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors">
            {/* @ts-expect-error */}
            <Icon className="h-4 w-4 text-text-secondary" />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium">{t as string}</div>
              <div className="text-[11.5px] text-text-muted">{d as string}</div>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}

function SpecsTable() {
  const specs = [
    { name: "payments-api", v: "2.3.0", endpoints: 42, status: "drift", req: "21,428" },
    { name: "auth-service", v: "1.8.2", endpoints: 18, status: "ok", req: "9,221" },
    { name: "orders-api", v: "3.1.0", endpoints: 31, status: "ok", req: "12,884" },
    { name: "inventory-api", v: "1.0.4", endpoints: 14, status: "warning", req: "4,758" },
  ];
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="text-[14px] font-semibold">Your specs</div>
        <Link to="/specs/$id" params={{ id: "payments-api" }} className="text-[12px] text-primary-hover hover:underline">Browse all</Link>
      </div>
      <table className="w-full text-[13px]">
        <thead className="text-[11px] uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-5 py-2.5 text-left font-medium">Spec</th>
            <th className="px-5 py-2.5 text-left font-medium">Version</th>
            <th className="px-5 py-2.5 text-left font-medium">Endpoints</th>
            <th className="px-5 py-2.5 text-left font-medium">Requests (24h)</th>
            <th className="px-5 py-2.5 text-left font-medium">Status</th>
            <th className="px-5 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {specs.map((s) => (
            <tr key={s.name} className="hover:bg-white/[0.02] transition-colors">
              <td className="px-5 py-3">
                <Link to="/specs/$id" params={{ id: s.name }} className="font-medium hover:text-primary-hover">{s.name}</Link>
              </td>
              <td className="px-5 py-3 font-mono text-text-secondary">v{s.v}</td>
              <td className="px-5 py-3 text-text-secondary">{s.endpoints}</td>
              <td className="px-5 py-3 font-mono text-text-secondary">{s.req}</td>
              <td className="px-5 py-3">
                {s.status === "ok" && <Badge tone="success">Healthy</Badge>}
                {s.status === "warning" && <Badge tone="warning">Warning</Badge>}
                {s.status === "drift" && <Badge tone="danger">Breaking drift</Badge>}
              </td>
              <td className="px-5 py-3 text-right">
                <Link to="/drift/$id" params={{ id: s.name }} className="text-[12px] text-text-secondary hover:text-foreground">Drift →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ tone, children }: { tone: "success" | "warning" | "danger"; children: React.ReactNode }) {
  const map = {
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/15 text-danger",
  } as const;
  return <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${map[tone]}`}><span className={`h-1.5 w-1.5 rounded-full ${map[tone].split(" ")[0].replace("/15","")}`} />{children}</span>;
}
