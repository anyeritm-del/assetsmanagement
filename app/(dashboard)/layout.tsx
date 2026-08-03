import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNavProvider } from "@/components/layout/MobileNavContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { properties, selected } = await getSelectedPropertyContext();

  return (
    <MobileNavProvider>
      <div className="flex h-full min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header properties={properties} selected={selected} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
