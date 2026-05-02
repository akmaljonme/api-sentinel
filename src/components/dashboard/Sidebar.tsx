import { Link, useRouterState } from "@tanstack/react-router";
import { Home, FileCode2, Server, GitCompare, Puzzle, Settings, ChevronsLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useState } from "react";

const items = [
  { to: "/dashboard", label: "Overview", Icon: Home },
  { to: "/specs/payments-api", label: "Specs", Icon: FileCode2 },
  { to: "/dashboard", label: "Mock Servers", Icon: Server },
  { to: "/drift/payments-api", label: "Drift Reports", Icon: GitCompare },
  { to: "/dashboard", label: "Integrations", Icon: Puzzle },
  { to: "/dashboard", label: "Settings", Icon: Settings },
];

export function DashboardSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ${
        collapsed ? "w-[68px]" : "w-[260px]"
      } sticky top-0 h-screen flex flex-col`}
    >
      <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && <Logo />}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="grid h-7 w-7 place-items-center rounded-md text-text-secondary hover:bg-white/5 hover:text-foreground transition-colors"
        >
          <ChevronsLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {items.map((it, i) => {
          const active = i === 0 ? path === "/dashboard" : path.startsWith(it.to) && it.to !== "/dashboard";
          return (
            <Link
              key={i}
              to={it.to}
              className={`group flex items-center gap-3 rounded-md px-2.5 h-9 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-primary/15 text-foreground shadow-[inset_0_0_0_1px_rgba(99,102,241,0.25)]"
                  : "text-text-secondary hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <it.Icon className={`h-4 w-4 ${active ? "text-primary-hover" : ""}`} />
              {!collapsed && <span>{it.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md p-2 hover:bg-white/5 transition-colors">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-[11px] font-semibold text-white">
            AC
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">Alex Chen</div>
              <div className="text-[11px] text-text-muted">alex@specsync.io</div>
            </div>
          )}
          {!collapsed && (
            <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary-hover">PRO</span>
          )}
        </div>
      </div>
    </aside>
  );
}
