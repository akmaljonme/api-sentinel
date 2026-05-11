import { Link, useRouterState } from "@tanstack/react-router";
import { Home, FileCode2, GitCompare, Settings, ChevronsLeft, LogOut, KeyRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import { useSession } from "@/lib/use-session";
import { signOut } from "@/lib/auth";

const items: { to: string; label: string; Icon: any; exact?: boolean; match?: string }[] = [
  { to: "/dashboard", label: "Overview", Icon: Home, exact: true },
  { to: "/settings", label: "Settings", Icon: Settings, match: "/settings" },
];

export function DashboardSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const { user, profile, org } = useSession();

  const initials = (profile?.full_name || user?.email || "?")
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <aside
      className={`shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ${
        collapsed ? "w-[68px]" : "w-[240px]"
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
        {items.map((it) => {
          const active = it.exact ? path === it.to : !!it.match && path.startsWith(it.match);
          return (
            <Link
              key={it.label}
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
        {!collapsed && (
          <div className="mt-5 px-2.5 text-[10px] uppercase tracking-wider text-text-muted">Resources</div>
        )}
        <a href="https://github.com" target="_blank" rel="noreferrer"
          className="flex items-center gap-3 rounded-md px-2.5 h-9 text-[13px] font-medium text-text-secondary hover:bg-white/5 hover:text-foreground transition-colors">
          <FileCode2 className="h-4 w-4" />
          {!collapsed && <span>Docs</span>}
        </a>
        <Link to="/settings" className="flex items-center gap-3 rounded-md px-2.5 h-9 text-[13px] font-medium text-text-secondary hover:bg-white/5 hover:text-foreground transition-colors">
          <KeyRound className="h-4 w-4" />
          {!collapsed && <span>API Keys</span>}
        </Link>
      </nav>
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <div className="flex items-center gap-3 rounded-md p-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-[11px] font-semibold text-white">
            {initials || "?"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">{profile?.full_name || user?.email?.split("@")[0] || "Account"}</div>
              <div className="truncate text-[11px] text-text-muted">{org?.name || user?.email}</div>
            </div>
          )}
          {!collapsed && org && (
            <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary-hover uppercase">
              {org.plan}
            </span>
          )}
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-md px-2.5 h-8 text-[12.5px] text-text-secondary hover:bg-white/5 hover:text-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
