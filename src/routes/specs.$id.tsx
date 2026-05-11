import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Search, Copy, Play, Loader2, GitCompare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSpec } from "@/lib/specs";
import { toast } from "sonner";

export const Route = createFileRoute("/specs/$id")({
  head: ({ params }) => ({ meta: [{ title: `Spec viewer — Flowt` }, { name: "description", content: "OpenAPI spec viewer with live mock preview." }] }),
  component: SpecPage,
});

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type Endpoint = {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: any[];
  requestBody?: any;
  responses?: any;
};

const methodColors: Record<string, string> = {
  GET: "text-blue-400 bg-blue-500/15",
  POST: "text-emerald-400 bg-emerald-500/15",
  PUT: "text-amber-400 bg-amber-500/15",
  DELETE: "text-rose-400 bg-rose-500/15",
  PATCH: "text-violet-400 bg-violet-500/15",
  HEAD: "text-zinc-400 bg-zinc-500/15",
};

function SpecPage() {
  const { id } = Route.useParams();
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"Overview" | "Try it" | "Live">("Overview");

  useEffect(() => {
    setLoading(true);
    getSpec(id).then((s) => { setSpec(s); setLoading(false); }).catch((e) => {
      toast.error(e.message); setLoading(false);
    });
  }, [id]);

  const endpoints: Endpoint[] = spec?.parsed_data?.endpoints || [];
  const mockServerId = spec?.mock_servers?.[0]?.id;

  const filtered = useMemo(
    () => endpoints.filter((e) => (e.path + e.method + (e.summary || "")).toLowerCase().includes(q.toLowerCase())),
    [endpoints, q]
  );
  const grouped = filtered.reduce<Record<string, Endpoint[]>>((acc, e) => {
    const tag = e.tags?.[0] || "Default";
    (acc[tag] ||= []).push(e);
    return acc;
  }, {});

  const ep = endpoints[active];

  if (loading) {
    return (
      <DashboardLayout crumbs={["Dashboard", "Specs"]} action={false}>
        <div className="grid place-items-center py-32 text-text-secondary"><Loader2 className="h-5 w-5 animate-spin" /></div>
      </DashboardLayout>
    );
  }
  if (!spec) {
    return (
      <DashboardLayout crumbs={["Dashboard", "Specs"]} action={false}>
        <div className="grid place-items-center py-32 text-text-secondary">Spec not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout crumbs={["Dashboard", "Specs", spec.name]} action={false}>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_360px] min-h-[calc(100vh-56px)]">
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
            <div className="mt-3 flex items-center justify-between px-1">
              <div className="text-[11px] uppercase tracking-wider text-text-muted truncate">{spec.name}</div>
              <span className="font-mono text-[10px] text-text-muted">v{spec.version || "—"}</span>
            </div>
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
                            onClick={() => { setActive(idx); setTab("Overview"); }}
                            className={`group w-full flex items-center gap-2 rounded-md px-1.5 h-8 text-left transition-colors ${
                              on ? "bg-primary/15 text-foreground" : "hover:bg-white/[0.04] text-text-secondary"
                            }`}
                          >
                            <span className={`inline-flex h-4 w-12 shrink-0 items-center justify-center rounded font-mono text-[9.5px] font-semibold ${methodColors[e.method] || "bg-white/5 text-text-secondary"}`}>{e.method}</span>
                            <span className="truncate font-mono text-[12px]">{e.path}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              {!endpoints.length && (
                <div className="text-[12px] text-text-muted px-1">No endpoints parsed yet.</div>
              )}
            </div>
          </div>
        </aside>

        {/* MIDDLE */}
        <section className="min-w-0 p-6 lg:p-8">
          {ep ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex h-7 px-2.5 items-center rounded-md font-mono text-[12px] font-semibold ${methodColors[ep.method]}`}>{ep.method}</span>
                <code className="font-mono text-[16px] text-foreground break-all">{ep.path}</code>
              </div>
              <p className="mt-2 text-[14px] text-text-secondary">{ep.summary || ep.description || "No description provided."}</p>

              <div className="mt-6 flex items-center gap-1 border-b border-border">
                {(["Overview", "Try it"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`relative h-9 px-3 text-[13px] transition-colors ${tab === t ? "text-foreground" : "text-text-secondary hover:text-foreground"}`}
                  >
                    {t}
                    {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
                  </button>
                ))}
                <Link to="/drift/$id" params={{ id: spec.id }} className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-foreground">
                  <GitCompare className="h-3.5 w-3.5" /> Drift reports
                </Link>
              </div>

              {tab === "Overview" ? (
                <OverviewTab ep={ep} />
              ) : (
                <TryItTab ep={ep} mockServerId={mockServerId} />
              )}
            </>
          ) : (
            <div className="grid place-items-center py-32 text-text-secondary">Select an endpoint</div>
          )}
        </section>

        {/* RIGHT */}
        <aside className="border-l border-border bg-surface/50">
          <div className="sticky top-14 p-4 space-y-4">
            <div>
              <div className="text-[12px] font-semibold">Live mock server</div>
              <div className="mt-1 text-[10.5px] text-text-muted">Send real HTTP requests to a schema-generated endpoint.</div>
            </div>
            {mockServerId ? (
              <>
                <div className="rounded-lg border border-border bg-background p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-text-muted">Base URL</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <code className="font-mono text-[11px] text-foreground break-all flex-1">
                      {SUPABASE_URL}/functions/v1/mock-server/{mockServerId}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${SUPABASE_URL}/functions/v1/mock-server/${mockServerId}`)}
                      className="grid h-6 w-6 place-items-center rounded border border-border text-text-secondary hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="text-[10.5px] text-text-muted">
                  Tip: pass the Supabase apikey header — your anon key is auto-included from the Try it tab.
                </div>
              </>
            ) : (
              <div className="text-[12px] text-text-muted">Mock server not yet provisioned.</div>
            )}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

function OverviewTab({ ep }: { ep: Endpoint }) {
  const params = ep.parameters || [];
  const reqSchema = ep.requestBody?.content?.["application/json"]?.schema;
  const okCode = Object.keys(ep.responses || {}).find((c) => c.startsWith("2")) || "200";
  const respSchema = ep.responses?.[okCode]?.content?.["application/json"]?.schema;

  return (
    <div className="mt-6 space-y-6">
      {params.length > 0 && (
        <Section title="Parameters">
          <SchemaTable
            rows={params.map((p: any) => [p.name, p.schema?.type || "string", !!p.required, p.description || `${p.in} parameter`])}
          />
        </Section>
      )}
      {reqSchema && (
        <Section title="Request body">
          <SchemaTable rows={schemaToRows(reqSchema)} />
        </Section>
      )}
      {respSchema && (
        <Section title={`Response · ${okCode}`}>
          <SchemaTable rows={schemaToRows(respSchema)} />
        </Section>
      )}
      {!params.length && !reqSchema && !respSchema && (
        <div className="text-[13px] text-text-secondary">This endpoint has no documented parameters or schema.</div>
      )}
    </div>
  );
}

function TryItTab({ ep, mockServerId }: { ep: Endpoint; mockServerId?: string }) {
  const [params, setParams] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [resp, setResp] = useState<{ status: number; body: any; ms: number } | null>(null);

  const pathParams = (ep.parameters || []).filter((p: any) => p.in === "path");
  const queryParams = (ep.parameters || []).filter((p: any) => p.in === "query");

  useEffect(() => {
    if (ep.method !== "GET" && ep.method !== "DELETE" && ep.requestBody) {
      const example = exampleFromSchema(ep.requestBody?.content?.["application/json"]?.schema);
      setBody(JSON.stringify(example, null, 2));
    } else {
      setBody("");
    }
    setParams({});
    setResp(null);
  }, [ep]);

  async function send() {
    if (!mockServerId) return toast.error("No mock server");
    let path = ep.path;
    pathParams.forEach((p: any) => {
      path = path.replaceAll(`{${p.name}}`, encodeURIComponent(params[p.name] || `sample_${p.name}`));
    });
    const qs = new URLSearchParams();
    queryParams.forEach((p: any) => { if (params[p.name]) qs.set(p.name, params[p.name]); });
    const url = `${SUPABASE_URL}/functions/v1/mock-server/${mockServerId}${path}${qs.toString() ? `?${qs}` : ""}`;
    setBusy(true);
    const start = performance.now();
    try {
      const res = await fetch(url, {
        method: ep.method,
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: body && ep.method !== "GET" && ep.method !== "DELETE" ? body : undefined,
      });
      const text = await res.text();
      let json: any; try { json = JSON.parse(text); } catch { json = text; }
      setResp({ status: res.status, body: json, ms: Math.round(performance.now() - start) });
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="mt-6 space-y-5">
      {pathParams.length > 0 && (
        <Section title="Path parameters">
          {pathParams.map((p: any) => (
            <ParamInput key={p.name} p={p} value={params[p.name] || ""} onChange={(v) => setParams({ ...params, [p.name]: v })} />
          ))}
        </Section>
      )}
      {queryParams.length > 0 && (
        <Section title="Query parameters">
          {queryParams.map((p: any) => (
            <ParamInput key={p.name} p={p} value={params[p.name] || ""} onChange={(v) => setParams({ ...params, [p.name]: v })} />
          ))}
        </Section>
      )}
      {ep.requestBody && (
        <Section title="Request body (JSON)">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} spellCheck={false}
            className="block w-full h-44 rounded-md border border-border bg-background p-3 font-mono text-[12px] text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </Section>
      )}

      <button
        disabled={busy}
        onClick={send}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
        Send to mock server
      </button>

      {resp && (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-3.5 py-2 text-[12px]">
            <span className={`inline-flex h-5 px-2 items-center rounded font-mono text-[11px] font-semibold ${resp.status < 300 ? "bg-success/15 text-success" : resp.status < 500 ? "bg-warning/15 text-warning" : "bg-danger/15 text-danger"}`}>{resp.status}</span>
            <span className="text-text-muted font-mono">{resp.ms}ms</span>
            <span className="ml-auto text-text-muted">Live response from your mock server</span>
          </div>
          <pre className="p-4 font-mono text-[12px] leading-6 text-text-secondary overflow-x-auto">{typeof resp.body === "string" ? resp.body : JSON.stringify(resp.body, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function ParamInput({ p, value, onChange }: { p: any; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 items-center">
      <div>
        <div className="font-mono text-[12.5px]">{p.name}{p.required && <span className="text-danger">*</span>}</div>
        <div className="text-[10.5px] text-text-muted">{p.schema?.type || "string"}</div>
      </div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={p.description || `Enter ${p.name}`}
        className="block h-9 rounded-md border border-border bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[12px] font-semibold uppercase tracking-wider text-text-muted">{title}</h3>
      {children}
    </div>
  );
}

function SchemaTable({ rows }: { rows: [string, string, boolean, string][] }) {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <table className="w-full text-[13px]">
        <tbody className="divide-y divide-border">
          {rows.map(([name, type, req, desc]) => (
            <tr key={name}>
              <td className="px-4 py-2.5 font-mono text-[12.5px]">{name}{req && <span className="text-danger">*</span>}</td>
              <td className="px-4 py-2.5 font-mono text-[12px] text-text-secondary">{type}</td>
              <td className="px-4 py-2.5 text-text-secondary">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function schemaToRows(schema: any): [string, string, boolean, string][] {
  if (!schema) return [];
  if (schema.type === "array") {
    return [["[items]", `array<${schema.items?.type || "object"}>`, false, "Array of items"]];
  }
  const required = new Set<string>(schema.required || []);
  const props = schema.properties || {};
  return Object.entries(props).map(([k, v]: [string, any]) => [
    k,
    v.type + (v.format ? `<${v.format}>` : ""),
    required.has(k),
    v.description || "—",
  ]);
}

function exampleFromSchema(schema: any): any {
  if (!schema) return {};
  if (schema.type === "object") {
    const obj: any = {};
    for (const [k, v] of Object.entries(schema.properties || {})) obj[k] = exampleFromSchema(v as any);
    return obj;
  }
  if (schema.type === "array") return [exampleFromSchema(schema.items)];
  if (schema.enum) return schema.enum[0];
  if (schema.format === "email") return "user@example.com";
  if (schema.format === "uuid") return crypto.randomUUID();
  if (schema.format === "date-time") return new Date().toISOString();
  if (schema.type === "string") return "string";
  if (schema.type === "integer" || schema.type === "number") return 0;
  if (schema.type === "boolean") return true;
  return null;
}
