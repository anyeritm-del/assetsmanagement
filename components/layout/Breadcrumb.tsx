import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-blue-600 dark:hover:text-blue-400">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
