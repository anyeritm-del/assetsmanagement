"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import type { Room } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const roomColumns: ColumnDef<Room>[] = [
  {
    accessorKey: "name",
    header: "Room Name",
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
      <Link
        href={`/location/${row.original.building_id}/floors/${row.original.floor_id}/rooms/${row.original.id}`}
        className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
        aria-label="Edit room"
        title="Edit room"
      >
        <Pencil className="h-4 w-4" />
      </Link>
    ),
  },
];
