import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { signOut } from "@/lib/auth";
import { Search, FileCode2, GitCompare, Home, Settings, LogOut, Plus, Sparkles } from "lucide-react";

type Item = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: any;
  run: () => void;
};

export function CommandPalette({ onNewSpec }: { onNewSpec: () => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [specs, setSpecs] = useState<any[]>([]);
  const [active, setActive] = useState(0);
  const nav = useNavigate();
  const { profile } = useSession();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open || !profile?.org_id) return;
    supabase.from("specs").select("id, name, version").eq("org_id", profile.org_id).limit(20)
      .then(({ data }) => setSpecs(data || []));
    setQ("");
    setActive(0);
  }, [open, profile?.org_id]);

  const items: Item[] = [
    { id: "new", label: "Upload new spec", hint: "Create", group: "Actions", icon: Plus, run: () => { onNewSpec(); setOpen(false); } },
    { id: "home", label: "Go to Dashboard", group: "Navigation", icon: Home, run: () => { nav({ to: "/dashboard" }); setOpen(false); } },
    { id: "settings", label: "Open Settings", hint: "Team, API Keys", group: "Navigation", icon: Settings, run: () => { nav({ to: "/settings" }); setOpen(false); } },
    ...specs.map((s) => ({
      id: s.id, label: s.name, hint: s.version || "", group: "Specs", icon: FileCode2,
      run: () => { nav({ to: "/specs/$id", params: { id: s.id } }); setOpen(false); },
    })),
    ...specs.map((s) => ({
      id: "drift-" + s.id, label: `Drift report — ${s.name}`, group: "Drift", icon: GitCompare,
      run: () => { nav({ to: "/drift/$id", params: { id: s.id } }); setOpen(false); },
    })),
    { id: "signout", label: "Sign out", group: "Account", icon: LogOut, run: () => { signOut(); setOpen(false); } },
  ];

  const filtered = q
    ? items.filter((i) => (i.label + " " + (i.hint || "")).toLowerCase().includes(q.toLowerCase()))
    : items;

  const groups: Record<string, Item[]> = {};
  filtered.forEach((i) => { (groups[i.group] ||= []).push(i); });

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(filtered.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter") { filtered[active]?.run(); }
  }

  if (!open) return null;
  let cursor = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-up" />
      <div
        className="relative w-full max-w-[640px] overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-[0_30px_120px_-20px_rgba(0,0,0,0.9)] animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 text-text-muted" />
          <input
            autoFocus value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={onKey}
            placeholder="Type a command or search…"
            className="h-12 flex-1 bg-transparent text-[14px] text-foreground placeholder:text-text-muted outline-none"
          />
          <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-text-muted">esc</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center text-[13px] text-text-muted">No results</div>
          )}
          {Object.entries(groups).map(([group, list]) => (
            <div key={group} className="mb-2">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">{group}</div>
              {list.map((it) => {
                cursor++;
                const isActive = cursor === active;
                return (
                  <button
                    key={it.id}
                    onClick={it.run}
                    onMouseEnter={() => setActive(cursor)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 h-9 text-[13px] text-left transition-colors ${
                      isActive ? "bg-primary/15 text-foreground" : "text-text-secondary hover:bg-white/5"
                    }`}
                  >
                    <it.icon className={`h-4 w-4 ${isActive ? "text-primary-hover" : "text-text-muted"}`} />
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.hint && <span className="font-mono text-[11px] text-text-muted">{it.hint}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border bg-background/40 px-4 py-2 text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Flowt Commands</div>
          <div className="flex items-center gap-3 font-mono">
            <span><kbd className="rounded bg-white/5 px-1 py-0.5">↑↓</kbd> navigate</span>
            <span><kbd className="rounded bg-white/5 px-1 py-0.5">↵</kbd> select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
