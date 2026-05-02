import { ReactNode } from "react";
import { DashboardSidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function DashboardLayout({ crumbs, children, action = true }: { crumbs: string[]; children: ReactNode; action?: boolean }) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar crumbs={crumbs} action={action} />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
