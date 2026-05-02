import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { RefreshCw, ChevronDown, Sparkles } from "lucide-react";

export const Route = createFileRoute("/drift/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Drift report` }, { name: "description", content: "Side-by-side spec diff with impact analysis." }] }),
  component: DriftPage,
});

const versions = ["v1.0", "v1.1", "v1.2", "v1.9", "v2.0"];

function DriftPage() {
  const { id } = Route.useParams();
  return (
    <DashboardLayout crumbs={["Dashboard", "Drift Reports", id]} action={false}>
      <div className="mx-auto max-w-7xl p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-semibold tracking-tight">{id}</h1>
              <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 h-7 text-[12px] text-text-secondary hover:border-border-hover hover:text-foreground transition-colors">
                v1.9 → v2.0 <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            <p className="mt-1 text-[12.5px] text-text-muted">Last checked 2 minutes ago</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-danger/15 px-2.5 py-1 text-[12px] font-medium text-danger">
              <span className="h-1.5 w-1.5 rounded-full bg-danger" /> 3 breaking changes
            </span>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-[12px] text-text-secondary hover:border-border-hover hover:text-foreground transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Version timeline */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-[11px] uppercase tracking-wider text-text-muted mb-3">Version history</div>
          <div className="relative flex items-center gap-2">
            {versions.map((v, i) => {
              const current = i === versions.length - 1;
              const prev = i === versions.length - 2;
              return (
                <div key={v} className="flex items-center gap-2">
                  <button
                    className={`group flex flex-col items-center ${current ? "text-foreground" : "text-text-secondary"}`}
                  >
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold transition-colors ${
                        current
                          ? "bg-primary text-white shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"
                          : prev
                          ? "bg-warning/20 text-warning"
                          : "bg-white/5 text-text-secondary group-hover:bg-white/10"
                      }`}
                    >
                      {v.replace("v", "")}
                    </span>
                    <span className="mt-1.5 text-[11px]">{v}</span>
                  </button>
                  {i < versions.length - 1 && <div className="h-px w-10 bg-border" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <ChangeGroup
              tone="danger"
              title="Breaking"
              count={3}
              items={[
                {
                  title: "Endpoint removed",
                  desc: "DELETE /users/{id}",
                  left: ["delete:", "  summary: Remove user", "  responses:", "    '204':", "      description: No Content"].map((l) => ({ l, kind: "del" })),
                  right: [{ l: "(removed)", kind: "muted" }],
                },
                {
                  title: "Required field added",
                  desc: "POST /orders → customer_id",
                  left: ["required:", "  - amount", "properties:", "  amount: integer"].map((l) => ({ l, kind: "ctx" })),
                  right: [
                    { l: "required:", kind: "ctx" },
                    { l: "  - amount", kind: "ctx" },
                    { l: "  - customer_id", kind: "add" },
                    { l: "properties:", kind: "ctx" },
                    { l: "  amount: integer", kind: "ctx" },
                    { l: "  customer_id: string", kind: "add" },
                  ],
                },
                {
                  title: "Auth scope renamed",
                  desc: "users.write → users.modify",
                  left: [{ l: "scopes: [users.write]", kind: "del" }],
                  right: [{ l: "scopes: [users.modify]", kind: "add" }],
                },
              ]}
            />
            <ChangeGroup
              tone="warning"
              title="Warning"
              count={1}
              items={[
                {
                  title: "Response field type changed",
                  desc: "GET /products → price (integer → float)",
                  left: [{ l: "price: integer", kind: "del" }],
                  right: [{ l: "price: number (float)", kind: "add" }],
                },
              ]}
            />
            <ChangeGroup
              tone="success"
              title="Info"
              count={2}
              items={[
                {
                  title: "Optional field added",
                  desc: "GET /users → avatar_url",
                  left: [{ l: "(not present)", kind: "muted" }],
                  right: [{ l: "avatar_url: string (optional)", kind: "add" }],
                },
                {
                  title: "New endpoint added",
                  desc: "GET /users/{id}/preferences",
                  left: [{ l: "(not present)", kind: "muted" }],
                  right: [{ l: "GET /users/{id}/preferences", kind: "add" }],
                },
              ]}
            />
          </div>

          {/* Impact sidebar */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="text-[12px] font-semibold">Impact analysis</div>
              <div className="mt-3 text-[11.5px] uppercase tracking-wider text-text-muted">What this breaks</div>
              <ul className="mt-2 space-y-2">
                {[
                  "3 frontend components use DELETE /users/{id}",
                  "12 integration tests will fail",
                  "1 mobile SDK release blocked",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-[13px] text-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-cyan-500/5 p-4">
              <div className="flex items-center gap-2 text-[12px] font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-primary-hover" /> Suggested fix
              </div>
              <p className="mt-2 text-[13px] text-text-secondary">
                Mark <code className="font-mono text-[12px] text-foreground">DELETE /users/{`{id}`}</code> as <code className="font-mono text-[12px] text-foreground">deprecated: true</code> instead of removing. Bump the major version to v3.0 and run a 30-day sunset window.
              </p>
              <button className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12px] font-medium text-white hover:bg-primary-hover transition-colors">
                Apply fix as PR
              </button>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="text-[12px] font-semibold">Reviewers</div>
              <div className="mt-3 space-y-2">
                {[
                  ["AC", "Alex Chen", "approved", "from-indigo-500 to-cyan-500"],
                  ["SK", "Sarah Kim", "requested", "from-rose-500 to-orange-500"],
                  ["MJ", "Marcus Johnson", "pending", "from-emerald-500 to-teal-500"],
                ].map(([i, n, s, g]) => (
                  <div key={n} className="flex items-center gap-2 text-[12.5px]">
                    <span className={`grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br ${g} text-[10px] font-semibold text-white`}>{i}</span>
                    <span className="flex-1">{n}</span>
                    <span className={`text-[11px] ${s === "approved" ? "text-success" : s === "requested" ? "text-warning" : "text-text-muted"}`}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

type Line = { l: string; kind: "add" | "del" | "ctx" | "muted" };

function ChangeGroup({
  tone, title, count, items,
}: {
  tone: "danger" | "warning" | "success";
  title: string;
  count: number;
  items: Array<{ title: string; desc: string; left: Line[]; right: Line[] }>;
}) {
  const map = {
    danger: { dot: "bg-danger", text: "text-danger", ring: "ring-danger/30" },
    warning: { dot: "bg-warning", text: "text-warning", ring: "ring-warning/30" },
    success: { dot: "bg-success", text: "text-success", ring: "ring-success/30" },
  } as const;
  return (
    <section>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${map[tone].dot}`} />
        <h3 className={`text-[12px] font-semibold uppercase tracking-wider ${map[tone].text}`}>{title}</h3>
        <span className="text-[11.5px] text-text-muted">({count})</span>
      </div>
      <div className="mt-3 space-y-3">
        {items.map((it, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <div>
                <div className="text-[13.5px] font-medium">{it.title}</div>
                <code className="font-mono text-[12px] text-text-secondary">{it.desc}</code>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border font-mono text-[12px] leading-6">
              <DiffColumn lines={it.left} side="left" />
              <DiffColumn lines={it.right} side="right" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DiffColumn({ lines, side }: { lines: Line[]; side: "left" | "right" }) {
  return (
    <div className="min-h-[3rem]">
      {lines.map((ln, i) => {
        const cls =
          ln.kind === "del"
            ? "bg-danger/10 text-rose-300"
            : ln.kind === "add"
            ? "bg-success/10 text-emerald-300"
            : ln.kind === "muted"
            ? "text-text-muted italic"
            : "text-text-secondary";
        const prefix = ln.kind === "del" ? "-" : ln.kind === "add" ? "+" : " ";
        return (
          <div key={i} className={`flex gap-2 px-4 ${cls}`}>
            <span className="select-none w-3 text-text-muted">{prefix}</span>
            <span>{ln.l}</span>
          </div>
        );
      })}
    </div>
  );
}
