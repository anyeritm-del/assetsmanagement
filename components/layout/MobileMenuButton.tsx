"use client";

import { Menu } from "lucide-react";
import { useMobileNav } from "./MobileNavContext";

export function MobileMenuButton() {
  const { toggle } = useMobileNav();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Open menu"
      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
