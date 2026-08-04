"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  Building2,
  ChevronDown,
  ClipboardCheck,
  HardHat,
  LayoutDashboard,
  MapPin,
  Move,
  PackageX,
  ShoppingCart,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { useMobileNav } from "./MobileNavContext";

const TOP_NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/approvals", label: "Approval", icon: ClipboardCheck },
  { href: "/my-jobs", label: "My Jobs", icon: HardHat },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/location", label: "Location", icon: MapPin },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
  { href: "/users", label: "Users", icon: Users },
];

interface NavGroup {
  label: string;
  icon: ComponentType<{ className?: string }>;
  children: { href: string; label: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Items",
    icon: Boxes,
    children: [
      { href: "/departments", label: "Departments" },
      { href: "/articles", label: "Articles" },
      { href: "/equipment", label: "Equipments" },
      { href: "/items", label: "Items" },
      { href: "/item-assignments", label: "Item Assign To User" },
      { href: "/import", label: "Import Items" },
    ],
  },
  {
    label: "Item Disposal",
    icon: PackageX,
    children: [
      { href: "/disposal-requests/new", label: "Create" },
      { href: "/disposal-requests", label: "Requests" },
    ],
  },
  {
    label: "Asset Loan",
    icon: ArrowLeftRight,
    children: [
      { href: "/outgoing-records/new", label: "Create" },
      { href: "/outgoing-records", label: "Requests" },
    ],
  },
  {
    label: "Item Movement",
    icon: Move,
    children: [
      { href: "/movement-requests/new", label: "Create" },
      { href: "/movement-requests", label: "Requests" },
    ],
  },
  {
    label: "Maintenance",
    icon: Wrench,
    children: [
      { href: "/maintenance-requests", label: "Requests" },
      { href: "/preventive-maintenance", label: "Preventive Maintenance" },
      { href: "/maintenance-categories", label: "Categories" },
      { href: "/maintenance-area-types", label: "Area Types" },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    children: [
      { href: "/reports/item", label: "Item" },
      { href: "/reports/disposal", label: "Disposal" },
      { href: "/reports/movement", label: "Movement" },
      { href: "/reports/depreciation", label: "Depreciation" },
      { href: "/reports/warranty", label: "Warranty" },
    ],
  },
];

function matchesHref(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

// Sibling links can share a prefix (e.g. "/disposal-requests" and "/disposal-requests/new") --
// the longest matching href wins, so visiting "/new" doesn't also light up "Requests".
function findActiveHref(pathname: string, allHrefs: string[]): string | null {
  let best: string | null = null;
  for (const href of allHrefs) {
    if (matchesHref(pathname, href) && (!best || href.length > best.length)) {
      best = href;
    }
  }
  return best;
}

function NavGroupSection({
  group,
  activeHref,
}: {
  group: NavGroup;
  activeHref: string | null;
}) {
  const groupActive = group.children.some((child) => child.href === activeHref);
  const [open, setOpen] = useState(groupActive);
  const Icon = group.icon;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          groupActive
            ? "text-blue-700 dark:text-blue-400"
            : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-1 pl-6">
          {group.children.map((child) => {
            const active = child.href === activeHref;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { open, close } = useMobileNav();
  const allHrefs = [
    ...TOP_NAV_ITEMS.map((item) => item.href),
    ...NAV_GROUPS.flatMap((group) => group.children.map((child) => child.href)),
  ];
  const activeHref = findActiveHref(pathname, allHrefs);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={close}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
          A
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Archipelago</p>
          <p className="text-xs text-slate-400">Asset Management</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {TOP_NAV_ITEMS.map((item) => {
          const active = item.href === activeHref;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {NAV_GROUPS.map((group) => (
          <NavGroupSection key={group.label} group={group} activeHref={activeHref} />
        ))}
      </nav>
      </aside>
    </>
  );
}
