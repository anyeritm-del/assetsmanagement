"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getNextCalendarMonthRange, getWarrantyExpiryDate } from "@/lib/reportHelpers";
import type { Building, Item, PurchaseOrder } from "@/lib/types";

interface WarrantyReportViewProps {
  items: Item[];
  buildingsById: Map<string, Building>;
  purchaseOrdersById: Map<string, PurchaseOrder>;
}

interface ItemWithWarranty {
  item: Item;
  expiryDate: Date;
}

export function WarrantyReportView({
  items,
  buildingsById,
  purchaseOrdersById,
}: WarrantyReportViewProps) {
  const trackedItems = useMemo(() => {
    const withExpiry: ItemWithWarranty[] = [];
    for (const item of items) {
      const expiryDate = getWarrantyExpiryDate(item, purchaseOrdersById);
      if (expiryDate) withExpiry.push({ item, expiryDate });
    }
    return withExpiry;
  }, [items, purchaseOrdersById]);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [results, setResults] = useState<ItemWithWarranty[]>(trackedItems);

  function handleCreateReport() {
    setResults(
      trackedItems.filter(({ expiryDate }) => {
        const dateStr = expiryDate.toISOString().slice(0, 10);
        if (dateFrom && dateStr < dateFrom) return false;
        if (dateTo && dateStr > dateTo) return false;
        return true;
      }),
    );
  }

  function handleReset() {
    setDateFrom("");
    setDateTo("");
    setResults(trackedItems);
  }

  function handleViewNextMonth() {
    const { start, end } = getNextCalendarMonthRange();
    setResults(trackedItems.filter(({ expiryDate }) => expiryDate >= start && expiryDate < end));
  }

  function handleViewAllExpired() {
    const today = new Date();
    setResults(trackedItems.filter(({ expiryDate }) => expiryDate < today));
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800";

  const columns: ColumnDef<ItemWithWarranty>[] = [
    { id: "name", header: "Name", cell: ({ row }) => row.original.item.name },
    {
      id: "code",
      header: "Code",
      cell: ({ row }) => row.original.item.code || "—",
    },
    {
      id: "building",
      header: "Building",
      cell: ({ row }) => buildingsById.get(row.original.item.building_id)?.name ?? "Unknown",
    },
    {
      id: "warranty_expiry_date",
      header: "Warranty Expiry Date",
      cell: ({ row }) => row.original.expiryDate.toISOString().slice(0, 10),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.item.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/items/${row.original.item.id}`}
          className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
          aria-label="View item"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Generate Report
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Quick Report:</span>
            <button
              type="button"
              onClick={handleViewNextMonth}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              View expired items next month
            </button>
            <button
              type="button"
              onClick={handleViewAllExpired}
              className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              View all expired items
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Date from
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Date to
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleCreateReport}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create Report
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Reset
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={results}
        searchPlaceholder="e.g. filter for item name, code, etc"
        emptyMessage="No items with tracked warranty match this report."
      />
    </div>
  );
}
