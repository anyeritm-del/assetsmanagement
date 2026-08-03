"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import type { Article } from "@/lib/types";

export const articleColumns: ColumnDef<Article>[] = [
  {
    accessorKey: "name",
    header: "Article Name",
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => row.original.unit || "—",
  },
  {
    accessorKey: "content",
    header: "Content",
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`/articles/${row.original.article_group_id}/articles/${row.original.id}`}
        className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
        aria-label="Edit article"
        title="Edit article"
      >
        <Pencil className="h-4 w-4" />
      </Link>
    ),
  },
];
