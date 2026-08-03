"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getNextCalendarMonthRange, isDateStringInRange } from "@/lib/reportHelpers";
import type { Building, Item } from "@/lib/types";

interface DepreciationReportViewProps {
  items: Item[];
  buildingsById: Map<string, Building>;
}

function withEndOfLifetime(items: Item[]): Item[] {
  return items.filter((item) => item.end_of_lifetime_date);
}

export function DepreciationReportView({ items, buildingsById }: DepreciationReportViewProps) {
  const trackedItems = withEndOfLifetime(items);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [results, setResults] = useState<Item[]>(trackedItems);

  function handleCreateReport() {
    setResults(
      trackedItems.filter((item) =>
        isDateStringInRange(item.end_of_lifetime_date as string, dateFrom || null, dateTo || null),
      ),
    );
  }

  function handleReset() {
    setDateFrom("");
    setDateTo("");
    setResults(trackedItems);
  }

  function handleViewNextMonth() {
    const { start, end } = getNextCalendarMonthRange();
    setResults(
      trackedItems.filter((item) => {
        const date = new Date(item.end_of_lifetime_date as string);
        return date >= start && date < end;
      }),
    );
  }

  function handleViewAllExpired() {
    const today = new Date();
    setResults(
      trackedItems.filter((item) => new Date(item.end_of_lifetime_date as string) < today),
    );
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800";

  const columns: ColumnDef<Item>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "code", header: "Code", cell: ({ row }) => row.original.code || "—" },
    {
      id: "building",
      header: "Building",
      cell: ({ row }) => buildingsById.get(row.original.building_id)?.name ?? "Unknown",
    },
    {
      id: "end_of_lifetime_date",
      header: "End of Lifetime Date",
      cell: ({ row }) => row.original.end_of_lifetime_date,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/items/${row.original.id}`}
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
              View deprecated items next month
            </button>
            <button
              type="button"
              onClick={handleViewAllExpired}
              className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              View all deprecated items
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
        emptyMessage="No items match this report."
      />
    </div>
  );
}
