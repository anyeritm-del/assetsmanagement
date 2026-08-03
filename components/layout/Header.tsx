import { LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import type { Property } from "@/lib/types";
import { MobileMenuButton } from "./MobileMenuButton";
import { PropertySwitcher } from "./PropertySwitcher";
import { ScanQrButton } from "./ScanQrButton";

interface HeaderProps {
  properties: Property[];
  selected: Property | null;
}

export async function Header({ properties, selected }: HeaderProps) {
  const session = await auth();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6 sm:py-4">
      <MobileMenuButton />
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3 sm:flex-initial sm:gap-4">
        <ScanQrButton />
        <PropertySwitcher properties={properties} selected={selected} />
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800 sm:pl-4">
          <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:inline">
            {session?.user?.name ?? session?.user?.email}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/signin" });
            }}
          >
            <button
              type="submit"
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
