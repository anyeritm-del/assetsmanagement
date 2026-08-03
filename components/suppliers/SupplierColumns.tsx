"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import type { Supplier } from "@/lib/types";

export const supplierColumns: ColumnDef<Supplier>[] = [
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
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone || "—",
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => row.original.address || "—",
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`/suppliers/${row.original.id}`}
        className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
        aria-label="Edit supplier"
        title="Edit supplier"
      >
        <Pencil className="h-4 w-4" />
      </Link>
    ),
  },
];
