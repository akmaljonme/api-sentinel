import { ReactNode, createContext, useContext, useState } from "react";
import { DashboardSidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { UploadSpecDialog } from "./UploadSpecDialog";
import { CommandPalette } from "./CommandPalette";
import { useAuthGuard } from "@/lib/use-auth-guard";

type Ctx = {
  openUpload: () => void;
  orgId: string | null;
};
const LayoutCtx = createContext<Ctx>({ openUpload: () => {}, orgId: null });
export const useDashboard = () => useContext(LayoutCtx);

export function DashboardLayout({
  crumbs,
  children,
  action = true,
}: {
  crumbs: string[];
  children: ReactNode;
  action?: boolean;
}) {
  const session = useAuthGuard();
  const [open, setOpen] = useState(false);
  const orgId = session.profile?.org_id ?? null;

  return (
    <LayoutCtx.Provider value={{ openUpload: () => setOpen(true), orgId }}>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <DashboardSidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <TopBar crumbs={crumbs} action={action} onNewSpec={() => setOpen(true)} />
          <div className="flex-1">{children}</div>
        </main>
        <UploadSpecDialog open={open} onOpenChange={setOpen} orgId={orgId} />
        <CommandPalette onNewSpec={() => setOpen(true)} />
      </div>
    </LayoutCtx.Provider>
  );
}
