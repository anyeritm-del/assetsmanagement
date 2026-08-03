"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import type { Department } from "@/lib/types";

export const departmentColumns: ColumnDef<Department>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => row.original.code || "—",
  },
  {
    accessorKey: "name",
    header: "Department",
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`/departments/${row.original.id}`}
        className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
        aria-label="Edit department"
        title="Edit department"
      >
        <Pencil className="h-4 w-4" />
      </Link>
    ),
  },
];
