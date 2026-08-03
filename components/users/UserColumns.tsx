"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { USER_LEVEL_LABELS } from "@/lib/constants";
import type { User } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || "—",
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => USER_LEVEL_LABELS[row.original.level],
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
        href={`/users/${row.original.id}`}
        className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
        aria-label="Edit user"
        title="Edit user"
      >
        <Pencil className="h-4 w-4" />
      </Link>
    ),
  },
];
