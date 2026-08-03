"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/currency";
import type { Article, Item } from "@/lib/types";

interface DashboardItemsTableProps {
  items: Item[];
  articlesById: Map<string, Article>;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function DashboardItemsTable({
  items,
  articlesById,
  searchPlaceholder = "e.g. filter for item name, article, etc",
  emptyMessage = "No data available.",
}: DashboardItemsTableProps) {
  const columns: ColumnDef<Item>[] = [
    {
      id: "article",
      header: "Article",
      cell: ({ row }) => {
        const article = row.original.article_id
          ? articlesById.get(row.original.article_id)
          : null;
        return article?.name ?? "—";
      },
    },
    { accessorKey: "name", header: "Name" },
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
          aria-label="Edit item"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
    />
  );
}
