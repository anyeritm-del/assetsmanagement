"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { PMDueStatusBadge } from "@/components/pmSchedules/PMDueStatusBadge";
import { PriorityBadge } from "@/components/maintenanceRequests/PriorityBadge";
import { getNextDueDate, getPMScheduleDueStatus } from "@/lib/pmScheduleStatus";
import type { Item, PMSchedule } from "@/lib/types";

interface PMSchedulesTableProps {
  schedules: PMSchedule[];
  itemsById: Map<string, Item>;
  viewOnly?: boolean;
}

function formatFrequency(schedule: PMSchedule): string {
  const unitLabel = schedule.frequency_unit + (schedule.frequency_interval === 1 ? "" : "s");
  return `Every ${schedule.frequency_interval} ${unitLabel}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const NEXT_DUE_TEXT_COLOR: Record<string, string> = {
  overdue: "text-rose-600 dark:text-rose-400",
  due_soon: "text-amber-600 dark:text-amber-400",
  upcoming: "text-slate-600 dark:text-slate-300",
};

export function PMSchedulesTable({
  schedules,
  itemsById,
  viewOnly = false,
}: PMSchedulesTableProps) {
  const columns: ColumnDef<PMSchedule>[] = [
    {
      id: "asset",
      header: "Asset",
      cell: ({ row }) => {
        const item = itemsById.get(row.original.item_id);
        return (
          <div>
            <Link
              href={`/items/${row.original.item_id}`}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {item?.code || "Unknown"}
            </Link>
            <p className="text-xs text-slate-400">{item?.name ?? ""}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Schedule Title",
    },
    {
      id: "frequency",
      header: "Frequency",
      cell: ({ row }) => formatFrequency(row.original),
    },
    {
      id: "last_run",
      header: "Last Run",
      cell: ({ row }) =>
        row.original.last_run_date ? formatDate(new Date(row.original.last_run_date)) : "–",
    },
    {
      id: "next_due",
      header: "Next Due",
      cell: ({ row }) => {
        const status = getPMScheduleDueStatus(row.original);
        return (
          <span className={`font-medium ${NEXT_DUE_TEXT_COLOR[status]}`}>
            {formatDate(getNextDueDate(row.original))}
          </span>
        );
      },
    },
    {
      id: "priority",
      header: "Priority",
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <PMDueStatusBadge status={getPMScheduleDueStatus(row.original)} />,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/preventive-maintenance/${row.original.id}`}
          className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
          aria-label="Edit PM schedule"
          title="Edit schedule"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={viewOnly ? columns.filter((column) => column.id !== "actions") : columns}
      data={schedules}
      searchPlaceholder="Search asset, title..."
      emptyMessage="No PM schedules yet. Add one to get started."
    />
  );
}
