"use client";

import Link from "next/link";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { PurchaseOrder, Supplier } from "@/lib/types";

export function createPurchaseOrderColumns(
  suppliersById: Map<string, Supplier>,
): ColumnDef<PurchaseOrder>[] {
  return [
    {
      accessorKey: "received_date",
      header: "Received Date",
      cell: ({ row }) => {
        const date = new Date(row.original.received_date);
        return Number.isNaN(date.getTime()) ? row.original.received_date : format(date, "d MMM yyyy");
      },
    },
    {
      id: "supplier",
      header: "Supplier",
      cell: ({ row }) =>
        row.original.supplier_id
          ? (suppliersById.get(row.original.supplier_id)?.name ?? "Unknown")
          : "—",
    },
    {
      accessorKey: "purchase_number",
      header: "Purchase Number",
      cell: ({ row }) => row.original.purchase_number || "—",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => formatCurrency(row.original.value),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/purchase-orders/${row.original.id}`}
          className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
          aria-label="Edit purchase order"
          title="Edit purchase order"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      ),
    },
  ];
}
