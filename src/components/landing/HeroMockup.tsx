export function HeroMockup() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-6xl">
      <div className="absolute -inset-x-20 -top-20 h-72 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.35)_0%,rgba(10,10,11,0)_70%)]" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_120px_-40px_rgba(99,102,241,0.4)]">
        {/* Window chrome */}
        <div className="flex h-10 items-center gap-2 border-b border-border bg-surface px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <div className="ml-4 flex items-center gap-2 text-xs text-text-muted font-mono">
            <span>specsync.app/dashboard/payments-api</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* YAML editor */}
          <div className="bg-[#0B0B0E] p-5 font-mono text-[12.5px] leading-6">
            <div className="mb-3 flex items-center gap-2 text-[11px] text-text-muted">
              <span className="rounded bg-white/5 px-1.5 py-0.5">openapi.yaml</span>
              <span>· payments-api · v2.3</span>
            </div>
            <pre className="whitespace-pre text-text-secondary">
{`openapi: 3.1.0
info:
  title: `}<span className="text-cyan-300">payments-api</span>{`
  version: `}<span className="text-cyan-300">2.3.0</span>{`
paths:
  `}<span className="text-indigo-300">{`/users/{id}`}</span>{`:
    `}<span className="text-rose-300 line-through">delete:</span>{`
      `}<span className="text-rose-300 line-through">summary: Remove user</span>{`
      `}<span className="text-rose-300 line-through">responses:</span>{`
        `}<span className="text-rose-300 line-through">'204':</span>{`
          `}<span className="text-rose-300 line-through">description: No Content</span>{`
  `}<span className="text-indigo-300">/orders</span>{`:
    post:
      requestBody:
        required: `}<span className="text-amber-300">true</span>{`
        content:
          application/json:
            schema:
              `}<span className="text-emerald-300">+ required: [customer_id]</span>{`
              properties:
                `}<span className="text-emerald-300">+ customer_id:</span>{`
                  `}<span className="text-emerald-300">+ type: string</span>{`
`}
            </pre>
          </div>
          {/* Drift dashboard */}
          <div className="bg-surface p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-text-muted">Drift report</div>
                <div className="mt-1 text-sm font-semibold">payments-api · v1.9 → v2.0</div>
              </div>
              <span className="rounded-md bg-danger/15 px-2 py-1 text-[11px] font-medium text-danger">3 breaking</span>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { sev: "danger", t: "Endpoint removed", d: "DELETE /users/{id}" },
                { sev: "danger", t: "Required field added", d: "POST /orders → customer_id" },
                { sev: "warning", t: "Type changed", d: "GET /products → price (int → float)" },
                { sev: "success", t: "Optional field added", d: "GET /users → avatar_url" },
                { sev: "success", t: "New endpoint", d: "GET /users/{id}/preferences" },
              ].map((it, i) => {
                const map: Record<string, string> = { danger: "bg-danger", warning: "bg-warning", success: "bg-success" };
                return (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-background/40 p-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${map[it.sev]}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-foreground">{it.t}</div>
                      <div className="truncate font-mono text-[12px] text-text-secondary">{it.d}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Floating notification */}
      <div className="absolute -bottom-6 left-6 hidden md:flex items-center gap-3 rounded-xl border border-border bg-surface-elevated/95 px-4 py-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-danger/15">
          <span className="h-2 w-2 rounded-full bg-danger animate-pulse-dot" />
        </span>
        <div>
          <div className="text-[13px] font-medium">Breaking change detected</div>
          <div className="font-mono text-[11px] text-text-secondary">DELETE /users/{`{id}`} · payments-api</div>
        </div>
      </div>
    </div>
  );
}
