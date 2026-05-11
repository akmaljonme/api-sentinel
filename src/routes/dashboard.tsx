import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout, useDashboard } from "@/components/dashboard/Layout";
import { FileCode2, Activity, AlertTriangle, ShieldCheck, Upload, Loader2, GitCompare, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/use-session";
import { getDashboardMetrics, getSpecs } from "@/lib/specs";
import { getMockRequestsByDay } from "@/lib/team";
import { Sparkline } from "@/components/dashboard/Sparkline";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Flowt" }, { name: "description", content: "API spec overview and recent activity." }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <DashboardLayout crumbs={["Dashboard", "Overview"]}>
      <DashboardBody />
    </DashboardLayout>
  );
}

function DashboardBody() {
  const { profile, user, loading } = useSession();
  const { openUpload } = useDashboard();
  const orgId = profile?.org_id ?? null;
  const [metrics, setMetrics] = useState<any>(null);
  const [specs, setSpecs] = useState<any[]>([]);
  const [series, setSeries] = useState<number[]>([]);
  const [busy, setBusy] = useState(true);

  async function refresh() {
    if (!orgId) return;
    setBusy(true);
    try {
      const [m, s, days] = await Promise.all([
        getDashboardMetrics(orgId),
        getSpecs(orgId),
        getMockRequestsByDay(orgId, 7),
      ]);
      setMetrics(m);
      setSpecs(s);
      setSeries(days.map((d) => d.count));
    } finally { setBusy(false); }
  }

  useEffect(() => { if (orgId) refresh(); }, [orgId]);

  if (loading || (orgId && busy && !metrics)) {
    return <div className="grid place-items-center py-32 text-text-secondary"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  const name = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const isEmpty = !specs.length;

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Welcome back, {name}</h1>
          <p className="mt-1 text-[13px] text-text-secondary">Live across your APIs in real time.</p>
        </div>
        <button onClick={openUpload} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-medium text-white hover:bg-primary-hover">
          <Plus className="h-3.5 w-3.5" /> New spec
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FileCode2} label="Active specs" value={String(metrics?.specCount ?? 0)} delta={`${specs.length} loaded`} tone="primary" />
        <Stat icon={Activity} label="Mock requests (24h)" value={(metrics?.mockRequestsToday ?? 0).toLocaleString()} delta="Live mock traffic" tone="success" />
        <Stat icon={AlertTriangle} label="Breaking drift (7d)" value={String(metrics?.breakingAlertsThisWeek ?? 0)} delta="Auto-detected" tone={metrics?.breakingAlertsThisWeek ? "danger" : "success"} />
        <Stat icon={ShieldCheck} label="Workspace" value={profile?.role || "owner"} delta="Role" tone="success" />
      </div>

      {!isEmpty && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[13px] font-semibold">Mock requests · last 7 days</div>
              <div className="text-[11px] text-text-muted mt-0.5">Total: {series.reduce((a, b) => a + b, 0).toLocaleString()}</div>
            </div>
            <span className="rounded-md bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success uppercase">Live</span>
          </div>
          <Sparkline data={series.length ? series : [0, 0, 0, 0, 0, 0, 0]} height={80} />
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] text-text-muted">
            {["6d", "5d", "4d", "3d", "2d", "1d", "Today"].map((l) => <div key={l}>{l}</div>)}
          </div>
        </div>
      )}

      {isEmpty ? (
        <EmptyState onUpload={openUpload} />
      ) : (
        <>
          <SpecsTable specs={specs} />
          <ActivityFeed events={metrics?.recentActivity || []} />
        </>
      )}
    </div>
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
      <div className="mt-3 text-[28px] font-semibold tracking-tight leading-none truncate">{value}</div>
      <div className="mt-2 text-[11px] text-text-muted">{delta}</div>
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary-hover">
        <Upload className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-[18px] font-semibold">Upload your first OpenAPI spec</h2>
      <p className="mt-1.5 text-[13px] text-text-secondary max-w-md mx-auto">
        Drop a YAML or JSON file. Flowt parses your endpoints, spins up a live mock server, and starts watching for breaking changes.
      </p>
      <button onClick={onUpload} className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-white hover:bg-primary-hover">
        <Plus className="h-4 w-4" /> Upload spec
      </button>
    </div>
  );
}

function ActivityFeed({ events }: { events: any[] }) {
  if (!events.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-5 py-3.5 text-[14px] font-semibold">Recent drift activity</div>
      <ol className="px-5 py-4 divide-y divide-border">
        {events.map((e) => (
          <li key={e.id} className="flex items-start gap-4 py-3">
            <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${e.breaking_count ? "bg-danger" : e.warning_count ? "bg-warning" : "bg-success"}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <Link to="/drift/$id" params={{ id: e.spec_id || "" }} className="text-[13px] font-medium hover:text-primary-hover truncate">
                  {e.specs?.name || "Spec"}
                </Link>
                <span className="text-[11px] text-text-muted">{new Date(e.created_at).toLocaleString()}</span>
              </div>
              <div className="mt-0.5 text-[12.5px] text-text-secondary">
                {e.breaking_count || 0} breaking · {e.warning_count || 0} warnings · {e.info_count || 0} info
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SpecsTable({ specs }: { specs: any[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="text-[14px] font-semibold">Your specs</div>
        <span className="text-[12px] text-text-muted">{specs.length} total</span>
      </div>
      <table className="w-full text-[13px]">
        <thead className="text-[11px] uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-5 py-2.5 text-left font-medium">Spec</th>
            <th className="px-5 py-2.5 text-left font-medium">Version</th>
            <th className="px-5 py-2.5 text-left font-medium">Endpoints</th>
            <th className="px-5 py-2.5 text-left font-medium">Mock requests</th>
            <th className="px-5 py-2.5 text-left font-medium">Status</th>
            <th className="px-5 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {specs.map((s) => {
            const reqCount = (s.mock_servers || []).reduce((n: number, m: any) => n + (m.request_count || 0), 0);
            const lastDrift = (s.drift_reports || []).sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at))[0];
            const breaking = lastDrift?.breaking_count > 0;
            return (
              <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <Link to="/specs/$id" params={{ id: s.id }} className="font-medium hover:text-primary-hover">{s.name}</Link>
                </td>
                <td className="px-5 py-3 font-mono text-text-secondary">{s.version || "—"}</td>
                <td className="px-5 py-3 text-text-secondary">{s.endpoint_count}</td>
                <td className="px-5 py-3 font-mono text-text-secondary">{reqCount.toLocaleString()}</td>
                <td className="px-5 py-3">
                  {breaking ? <Badge tone="danger">Breaking drift</Badge> : <Badge tone="success">Healthy</Badge>}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link to="/drift/$id" params={{ id: s.id }} className="inline-flex items-center gap-1 text-[12px] text-text-secondary hover:text-foreground">
                    <GitCompare className="h-3 w-3" /> Drift
                  </Link>
                </td>
              </tr>
            );
          })}
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
  return <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${map[tone]}`}>{children}</span>;
}
