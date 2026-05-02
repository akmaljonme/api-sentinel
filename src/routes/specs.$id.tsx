import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Search, Copy, RefreshCw, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/specs/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Spec viewer` }, { name: "description", content: "OpenAPI spec viewer with live mock preview." }] }),
  component: SpecPage,
});

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type EP = { method: Method; path: string; tag: string; summary: string };
const endpoints: EP[] = [
  { method: "GET", path: "/users", tag: "Users", summary: "List all users" },
  { method: "GET", path: "/users/{id}", tag: "Users", summary: "Get user by id" },
  { method: "POST", path: "/users", tag: "Users", summary: "Create user" },
  { method: "PUT", path: "/users/{id}", tag: "Users", summary: "Replace user" },
  { method: "DELETE", path: "/users/{id}", tag: "Users", summary: "Delete user" },
  { method: "GET", path: "/orders", tag: "Orders", summary: "List orders" },
  { method: "POST", path: "/orders", tag: "Orders", summary: "Create order" },
  { method: "GET", path: "/products", tag: "Products", summary: "List products" },
  { method: "GET", path: "/products/{id}", tag: "Products", summary: "Get product" },
  { method: "PATCH", path: "/products/{id}", tag: "Products", summary: "Update product" },
];

const methodColors: Record<Method, string> = {
  GET: "text-blue-400 bg-blue-500/15",
  POST: "text-emerald-400 bg-emerald-500/15",
  PUT: "text-amber-400 bg-amber-500/15",
  DELETE: "text-rose-400 bg-rose-500/15",
  PATCH: "text-violet-400 bg-violet-500/15",
};

function SpecPage() {
  const { id } = Route.useParams();
  const [active, setActive] = useState(1);
  const [tab, setTab] = useState<"Overview" | "Request" | "Response" | "Try it">("Overview");
  const [lang, setLang] = useState<"curl" | "JavaScript" | "Python">("curl");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => endpoints.filter((e) => (e.path + e.method + e.summary).toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  const grouped = filtered.reduce<Record<string, EP[]>>((acc, e) => {
    (acc[e.tag] ||= []).push(e);
    return acc;
  }, {});

  const ep = endpoints[active];

  return (
    <DashboardLayout crumbs={["Dashboard", "Specs", id]} action={false}>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_340px] min-h-[calc(100vh-56px)]">
        {/* LEFT */}
        <aside className="border-r border-border bg-surface/50">
          <div className="sticky top-14 p-3">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 h-8 text-[12.5px]">
              <Search className="h-3.5 w-3.5 text-text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search endpoints"
                className="w-full bg-transparent placeholder:text-text-muted focus:outline-none"
              />
            </div>
            <div className="mt-3 text-[11px] uppercase tracking-wider text-text-muted px-1">{id} · v2.3.0</div>
            <div className="mt-2 space-y-4">
              {Object.entries(grouped).map(([tag, list]) => (
                <div key={tag}>
                  <div className="px-1 mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-text-muted">{tag}</div>
                  <ul className="space-y-0.5">
                    {list.map((e) => {
                      const idx = endpoints.indexOf(e);
                      const on = idx === active;
                      return (
                        <li key={e.method + e.path}>
                          <button
                            onClick={() => setActive(idx)}
                            className={`group w-full flex items-center gap-2 rounded-md px-1.5 h-8 text-left transition-colors ${
                              on ? "bg-primary/15 text-foreground" : "hover:bg-white/[0.04] text-text-secondary"
                            }`}
                          >
                            <span className={`inline-flex h-4 w-12 shrink-0 items-center justify-center rounded font-mono text-[9.5px] font-semibold ${methodColors[e.method]}`}>{e.method}</span>
                            <span className="truncate font-mono text-[12px]">{e.path}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MIDDLE */}
        <section className="min-w-0 p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex h-7 px-2.5 items-center rounded-md font-mono text-[12px] font-semibold ${methodColors[ep.method]}`}>{ep.method}</span>
            <code className="font-mono text-[16px] text-foreground">{ep.path}</code>
            <button className="grid h-7 w-7 place-items-center rounded-md border border-border text-text-secondary hover:border-border-hover hover:text-foreground transition-colors">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-[14px] text-text-secondary">{ep.summary}</p>

          <div className="mt-6 flex items-center gap-1 border-b border-border">
            {(["Overview", "Request", "Response", "Try it"] as const).map((t) => {
              const on = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative h-9 px-3 text-[13px] transition-colors ${on ? "text-foreground" : "text-text-secondary hover:text-foreground"}`}
                >
                  {t}
                  {on && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>

          {tab === "Overview" && (
            <div className="mt-6 space-y-6">
              <Section title="Description">
                <p className="text-[14px] text-text-secondary">
                  Returns a single user resource by its unique identifier. Requires a valid bearer token with <code className="font-mono text-[12px] text-foreground">users.read</code> scope.
                </p>
              </Section>
              <Section title="Request">
                <SchemaTable rows={[
                  ["id", "string", true, "Unique identifier of the user"],
                  ["expand", "string[]", false, "Related fields to expand inline"],
                ]} />
              </Section>
              <Section title="Response · 200">
                <SchemaTable rows={[
                  ["id", "string", true, "User id"],
                  ["email", "string", true, "Primary email"],
                  ["name", "string", true, "Full name"],
                  ["plan", "enum", true, "free | pro | team"],
                  ["created_at", "datetime", true, "ISO-8601 timestamp"],
                ]} />
              </Section>
              <Section title="Code examples">
                <div className="rounded-lg border border-border bg-surface overflow-hidden">
                  <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
                    {(["curl", "JavaScript", "Python"] as const).map((l) => (
                      <button key={l} onClick={() => setLang(l)} className={`rounded px-2.5 h-7 text-[12px] transition-colors ${lang === l ? "bg-white/[0.06] text-foreground" : "text-text-secondary hover:text-foreground"}`}>{l}</button>
                    ))}
                  </div>
                  <pre className="p-4 font-mono text-[12.5px] leading-6 text-text-secondary whitespace-pre overflow-x-auto">
                    {lang === "curl" && `curl https://api.specsync.app/users/usr_42 \\\n  -H "Authorization: Bearer $TOKEN"`}
                    {lang === "JavaScript" && `await fetch("https://api.specsync.app/users/usr_42", {\n  headers: { Authorization: \`Bearer \${token}\` }\n}).then(r => r.json())`}
                    {lang === "Python" && `import requests\nrequests.get(\n  "https://api.specsync.app/users/usr_42",\n  headers={"Authorization": f"Bearer {token}"},\n).json()`}
                  </pre>
                </div>
              </Section>
            </div>
          )}
          {tab !== "Overview" && (
            <div className="mt-10 grid place-items-center text-center text-text-secondary">
              <div>
                <div className="mx-auto h-12 w-12 rounded-full border border-border bg-surface grid place-items-center">
                  <ChevronRight className="h-5 w-5 text-text-muted" />
                </div>
                <p className="mt-3 text-[13px]">{tab} view — interactive in the full app.</p>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT */}
        <aside className="border-l border-border bg-surface/50">
          <div className="sticky top-14 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] font-semibold">Live mock response</div>
                <div className="text-[10.5px] text-text-muted">Generated from schema</div>
              </div>
              <button className="grid h-7 w-7 place-items-center rounded-md border border-border text-text-secondary hover:border-border-hover hover:text-foreground transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <pre className="rounded-lg border border-border bg-background p-3 font-mono text-[12px] leading-6 text-text-secondary">
{`{
  "id": `}<span className="text-cyan-300">"usr_42"</span>{`,
  "email": `}<span className="text-cyan-300">"ada@lovelace.dev"</span>{`,
  "name": `}<span className="text-cyan-300">"Ada Lovelace"</span>{`,
  "plan": `}<span className="text-emerald-300">"pro"</span>{`,
  "created_at": `}<span className="text-cyan-300">"2024-09-12T10:24:00Z"</span>{`
}`}
            </pre>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text-muted">Mock URL</div>
              <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-background px-2.5 h-8">
                <code className="flex-1 truncate font-mono text-[11.5px] text-text-secondary">mock.specsync.app/{id}{ep.path}</code>
                <button className="text-text-secondary hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3 text-[12px] text-text-secondary">
              <div className="font-medium text-foreground">Latency · last hour</div>
              <div className="mt-2 flex items-end gap-1 h-12">
                {[40, 55, 38, 62, 48, 70, 52, 44, 58, 36, 49, 60].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }} className="flex-1 rounded-sm bg-primary/40" />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10.5px] text-text-muted">
                <span>p50 32ms</span><span>p95 78ms</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[12px] font-semibold uppercase tracking-wider text-text-muted mb-2">{title}</div>
      {children}
    </div>
  );
}

function SchemaTable({ rows }: { rows: Array<[string, string, boolean, string]> }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-[13px]">
        <thead className="bg-surface text-[11px] uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Field</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-left font-medium">Required</th>
            <th className="px-3 py-2 text-left font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(([f, t, r, d]) => (
            <tr key={f} className="hover:bg-white/[0.02]">
              <td className="px-3 py-2 font-mono text-foreground">{f}</td>
              <td className="px-3 py-2 font-mono text-text-secondary">{t}</td>
              <td className="px-3 py-2">{r ? <span className="text-danger">required</span> : <span className="text-text-muted">optional</span>}</td>
              <td className="px-3 py-2 text-text-secondary">{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
