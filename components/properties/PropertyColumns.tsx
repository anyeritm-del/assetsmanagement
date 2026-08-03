"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import type { Property } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const propertyColumns: ColumnDef<Property>[] = [
  {
    accessorKey: "name",
    header: "Hotel Name",
  },
  {
    accessorKey: "code",
    header: "Code",
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
        href={`/properties/${row.original.id}`}
        className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
        aria-label="Edit property"
        title="Edit property"
      >
        <Pencil className="h-4 w-4" />
      </Link>
    ),
  },
];
