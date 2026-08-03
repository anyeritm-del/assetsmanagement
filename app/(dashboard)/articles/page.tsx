import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { articleGroupColumns } from "@/components/articles/ArticleGroupColumns";
import { listArticleGroups } from "@/lib/repositories/articleGroups";

export default async function ArticleGroupsPage() {
  const articleGroups = await listArticleGroups();

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Articles" }, { label: "Group" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Articles</h1>
        <Link
          href="/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Link>
      </div>
      <DataTable
        columns={articleGroupColumns}
        data={articleGroups}
        searchPlaceholder="e.g. filter for group name, etc"
        emptyMessage="No article groups yet. Create one to get started."
      />
    </div>
  );
}
