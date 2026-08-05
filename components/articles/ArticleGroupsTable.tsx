"use client";

import { DataTable } from "@/components/ui/DataTable";
import { createArticleGroupColumns } from "@/components/articles/ArticleGroupColumns";
import type { ArticleGroup } from "@/lib/types";

interface ArticleGroupsTableProps {
  articleGroups: ArticleGroup[];
  viewOnly: boolean;
}

export function ArticleGroupsTable({ articleGroups, viewOnly }: ArticleGroupsTableProps) {
  return (
    <DataTable
      columns={createArticleGroupColumns(viewOnly)}
      data={articleGroups}
      searchPlaceholder="e.g. filter for group name, etc"
      emptyMessage="No article groups yet. Create one to get started."
    />
  );
}
