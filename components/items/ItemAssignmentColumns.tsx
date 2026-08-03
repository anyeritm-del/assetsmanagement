"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import type { Employee, Item } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/currency";

export function createItemAssignmentColumns(
  employeesById: Map<string, Employee>,
): ColumnDef<Item>[] {
  return [
    {
      accessorKey: "name",
      header: "Item Name",
    },
    {
      id: "employee",
      header: "Employee",
      cell: ({ row }) => {
        const employee = row.original.assigned_employee_id
          ? employeesById.get(row.original.assigned_employee_id)
          : null;
        return employee?.name ?? "—";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "acquisition_value",
      header: "Acquisition Value",
      cell: ({ row }) => formatCurrency(row.original.acquisition_value),
    },
    {
      accessorKey: "book_value",
      header: "Book Value",
      cell: ({ row }) => formatCurrency(row.original.book_value),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/items/${row.original.id}`}
          className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
          aria-label="Edit item assignment"
          title="Edit item assignment"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      ),
    },
  ];
}
