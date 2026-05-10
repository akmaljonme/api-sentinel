import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { useEffect, useState } from "react";
import { getSpec, getDriftReports, runDriftCheck } from "@/lib/specs";
import { AlertTriangle, AlertCircle, Info, Loader2, Upload, ArrowLeft, GitCompare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/drift/$id")({
  head: () => ({ meta: [{ title: "Drift report — Flowt" }, { name: "description", content: "Spec drift report and breaking change history." }] }),
  component: DriftPage,
});

function DriftPage() {
  const { id } = Route.useParams();
  const [spec, setSpec] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([getSpec(id), getDriftReports(id)]);
      setSpec(s);
      setReports(r);
      setActive(r[0]?.id ?? null);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [id]);

  async function onFile(f: File) {
    const text = await f.text();
    setNewContent(text);
  }

  async function compare() {
    if (!newContent.trim()) return toast.error("Paste or upload a new spec version");
    setBusy(true);
    try {
      await runDriftCheck(id, newContent);
      toast.success("Drift report generated");
      setShowCompare(false);
      setNewContent("");
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  if (loading) {
    return (
      <DashboardLayout crumbs={["Dashboard", "Drift"]} action={false}>
        <div className="grid place-items-center py-32 text-text-secondary"><Loader2 className="h-5 w-5 animate-spin" /></div>
      </DashboardLayout>
    );
  }
  if (!spec) return null;

  const report = reports.find((r) => r.id === active);
  const changes: any[] = (report?.changes as any[]) || [];
  const breaking = changes.filter((c) => c.severity === "breaking");
  const warnings = changes.filter((c) => c.severity === "warning");
  const info = changes.filter((c) => c.severity === "info");

  return (
    <DashboardLayout crumbs={["Dashboard", "Drift", spec.name]} action={false}>
      <div className="mx-auto max-w-7xl p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link to="/specs/$id" params={{ id: spec.id }} className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> Back to spec
            </Link>
            <h1 className="mt-2 text-[24px] font-semibold tracking-tight">Drift reports · {spec.name}</h1>
            <p className="mt-1 text-[13px] text-text-secondary">Compare spec versions to detect breaking changes before they ship.</p>
          </div>
          <button onClick={() => setShowCompare((v) => !v)} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-[13px] font-medium text-white hover:bg-primary-hover">
            <GitCompare className="h-3.5 w-3.5" /> Compare new version
          </button>
        </div>

        {showCompare && (
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
            <div className="text-[14px] font-semibold">Upload updated spec</div>
            <label className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background/40 py-6 cursor-pointer hover:border-primary/50">
              <Upload className="h-4 w-4 text-text-secondary" />
              <span className="text-[13px] text-text-secondary">Click to upload .yaml / .json</span>
              <input type="file" accept=".yaml,.yml,.json" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </label>
            <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} spellCheck={false}
              placeholder="…or paste new spec version"
              className="block w-full h-44 rounded-md border border-border bg-background p-3 font-mono text-[12px] text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCompare(false)} className="h-9 rounded-md border border-border bg-surface px-3 text-[13px] hover:border-border-hover">Cancel</button>
              <button disabled={busy} onClick={compare} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-[13px] font-medium text-white hover:bg-primary-hover disabled:opacity-60">
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Run drift check
              </button>
            </div>
          </div>
        )}

        {!reports.length ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/40 p-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary-hover">
              <GitCompare className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-[16px] font-semibold">No drift reports yet</h2>
            <p className="mt-1 text-[13px] text-text-secondary">Upload a new version of this spec to detect breaking changes.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="border-b border-border px-4 py-2.5 text-[12px] font-semibold">History</div>
              <ul>
                {reports.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => setActive(r.id)}
                      className={`w-full text-left px-4 py-3 border-b border-border transition-colors ${active === r.id ? "bg-primary/10" : "hover:bg-white/[0.03]"}`}
                    >
                      <div className="text-[12.5px] font-mono">{r.old_version || "v?"} → {r.new_version || "v?"}</div>
                      <div className="mt-1 text-[10.5px] text-text-muted">{new Date(r.created_at).toLocaleString()}</div>
                      <div className="mt-1.5 flex gap-1.5 text-[10px]">
                        {r.breaking_count > 0 && <span className="rounded bg-danger/15 px-1.5 py-0.5 text-danger">{r.breaking_count} breaking</span>}
                        {r.warning_count > 0 && <span className="rounded bg-warning/15 px-1.5 py-0.5 text-warning">{r.warning_count} warn</span>}
                        {r.info_count > 0 && <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-blue-400">{r.info_count} info</span>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <section className="space-y-5">
              {report ? (
                <>
                  <Group title="Breaking changes" tone="danger" Icon={AlertCircle} items={breaking} />
                  <Group title="Warnings" tone="warning" Icon={AlertTriangle} items={warnings} />
                  <Group title="Info" tone="info" Icon={Info} items={info} />
                  {!changes.length && <div className="rounded-xl border border-success/30 bg-success/10 p-5 text-[13px] text-success">No changes detected — specs are identical.</div>}
                </>
              ) : (
                <div className="text-text-secondary">Select a report</div>
              )}
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Group({ title, tone, Icon, items }: { title: string; tone: "danger" | "warning" | "info"; Icon: any; items: any[] }) {
  if (!items.length) return null;
  const toneMap = {
    danger: "border-danger/30 bg-danger/5 text-danger",
    warning: "border-warning/30 bg-warning/5 text-warning",
    info: "border-blue-500/30 bg-blue-500/5 text-blue-400",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className={`flex items-center gap-2 border-b border-border px-4 py-2.5 ${toneMap[tone]}`}>
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[12.5px] font-semibold">{title} · {items.length}</span>
      </div>
      <ul className="divide-y divide-border">
        {items.map((c, i) => (
          <li key={i} className="px-4 py-3.5">
            <div className="font-mono text-[12.5px] text-foreground">{c.path}</div>
            <div className="mt-1 text-[13px] text-text-secondary">{c.message}</div>
            {c.suggestion && (
              <div className="mt-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-[12px] text-text-secondary">
                <span className="text-text-muted">Suggestion: </span>{c.suggestion}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
