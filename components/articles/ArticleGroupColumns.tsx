"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { List, Pencil } from "lucide-react";
import type { ArticleGroup } from "@/lib/types";

export function createArticleGroupColumns(viewOnly: boolean): ColumnDef<ArticleGroup>[] {
  return [
    {
      accessorKey: "name",
      header: "Group Name",
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {!viewOnly && (
            <Link
              href={`/articles/${row.original.id}`}
              className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
              aria-label="Edit article group"
              title="Edit article group"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          )}
          <Link
            href={`/articles/${row.original.id}/articles`}
            className="inline-flex items-center justify-center rounded-full border border-emerald-200 p-2 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
            aria-label={`View articles in ${row.original.name}`}
            title={`View articles in ${row.original.name}`}
          >
            <List className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];
}
