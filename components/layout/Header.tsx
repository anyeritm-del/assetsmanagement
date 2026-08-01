import { LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import type { Property } from "@/lib/types";
import { PropertySwitcher } from "./PropertySwitcher";

interface HeaderProps {
  properties: Property[];
  selected: Property | null;
}

export async function Header({ properties, selected }: HeaderProps) {
  const session = await auth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
      <div />
      <div className="flex items-center gap-4">
        <PropertySwitcher properties={properties} selected={selected} />
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-800">
          <span className="text-sm text-slate-600 dark:text-slate-300">
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
