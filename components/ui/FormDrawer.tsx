import Link from "next/link";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface FormDrawerProps {
  title: string;
  backHref: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function FormDrawer({ title, backHref, actions, children }: FormDrawerProps) {
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <div className="flex items-center gap-2">
          {actions}
          <Link
            href={backHref}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
