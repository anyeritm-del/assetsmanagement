"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { List, Pencil } from "lucide-react";
import type { Floor } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const floorColumns: ColumnDef<Floor>[] = [
  {
    accessorKey: "name",
    header: "Floor Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description || "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/location/${row.original.building_id}/floors/${row.original.id}`}
          className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
          aria-label="Edit floor"
          title="Edit floor"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <Link
          href={`/location/${row.original.building_id}/floors/${row.original.id}/rooms`}
          className="inline-flex items-center justify-center rounded-full border border-emerald-200 p-2 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
          aria-label={`View rooms of ${row.original.name}`}
          title={`View rooms of ${row.original.name}`}
        >
          <List className="h-4 w-4" />
        </Link>
      </div>
    ),
  },
];
