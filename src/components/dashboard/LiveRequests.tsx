import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MethodBadge } from "@/routes/index";
import { Activity } from "lucide-react";

export function LiveRequests({ mockServerId }: { mockServerId: string }) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!mockServerId) return;
    supabase
      .from("mock_requests")
      .select("*")
      .eq("mock_server_id", mockServerId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setRows(data || []));

    const ch = supabase
      .channel(`mock-req-${mockServerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mock_requests", filter: `mock_server_id=eq.${mockServerId}` },
        (p) => setRows((r) => [p.new as any, ...r].slice(0, 50)),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [mockServerId]);

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Live request stream
        </div>
        <span className="text-[11px] text-text-muted">{rows.length} recent</span>
      </div>
      {rows.length === 0 ? (
        <div className="px-5 py-12 text-center text-[12px] text-text-muted">
          <Activity className="mx-auto mb-2 h-4 w-4" />
          Waiting for first request… try the <span className="text-foreground">Try it</span> tab above.
        </div>
      ) : (
        <ul className="divide-y divide-border max-h-[480px] overflow-y-auto">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-5 py-2 hover:bg-white/[0.02]">
              <MethodBadge method={r.method} />
              <code className="flex-1 truncate font-mono text-[12px] text-foreground">{r.path}</code>
              <span className={`font-mono text-[11px] rounded px-1.5 py-0.5 ${
                r.status_code < 300 ? "bg-success/15 text-success" : r.status_code < 400 ? "bg-warning/15 text-warning" : "bg-danger/15 text-danger"
              }`}>{r.status_code}</span>
              <span className="font-mono text-[11px] text-text-muted w-14 text-right">{r.duration_ms}ms</span>
              <span className="font-mono text-[10px] text-text-muted w-20 text-right">
                {new Date(r.created_at).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
