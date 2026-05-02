import { Bell, Plus, Search, ChevronRight } from "lucide-react";

export function TopBar({ crumbs, action = true }: { crumbs: string[]; action?: boolean }) {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
      <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className={i === crumbs.length - 1 ? "text-foreground font-medium" : ""}>{c}</span>
            {i < crumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-text-muted" />}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button className="hidden md:flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-[12px] text-text-muted hover:border-border-hover hover:text-text-secondary transition-colors">
          <Search className="h-3.5 w-3.5" /> Search… <kbd className="ml-2 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">⌘K</kbd>
        </button>
        <button className="relative grid h-8 w-8 place-items-center rounded-md border border-border text-text-secondary hover:border-border-hover hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">3</span>
        </button>
        {action && (
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-white hover:bg-primary-hover transition-colors">
            <Plus className="h-3.5 w-3.5" /> New spec
          </button>
        )}
      </div>
    </div>
  );
}
