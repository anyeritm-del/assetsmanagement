"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown } from "lucide-react";
import { setSelectedProperty } from "@/lib/actions/properties";
import type { Property } from "@/lib/types";

interface PropertySwitcherProps {
  properties: Property[];
  selected: Property | null;
}

export function PropertySwitcher({ properties, selected }: PropertySwitcherProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSelect(propertyId: string) {
    setOpen(false);
    startTransition(async () => {
      await setSelectedProperty(propertyId);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isPending}
        className="flex max-w-[55vw] items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:max-w-xs"
      >
        <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate">{selected ? selected.name : "Select a property"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {properties.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-400">No active properties found.</p>
            )}
            {properties.map((property) => (
              <button
                key={property.id}
                type="button"
                onClick={() => handleSelect(property.id)}
                className={`block w-full truncate px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  selected?.id === property.id
                    ? "font-semibold text-blue-700 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {property.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
