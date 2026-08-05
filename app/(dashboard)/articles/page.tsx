import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ArticleGroupsTable } from "@/components/articles/ArticleGroupsTable";
import { listArticleGroups } from "@/lib/repositories/articleGroups";
import { isViewOnly } from "@/lib/viewOnlyGuard";

export default async function ArticleGroupsPage() {
  const [articleGroups, viewOnly] = await Promise.all([listArticleGroups(), isViewOnly()]);

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Articles" }, { label: "Group" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Articles</h1>
        {!viewOnly && (
          <Link
            href="/articles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        )}
      </div>
      <ArticleGroupsTable articleGroups={articleGroups} viewOnly={viewOnly} />
    </div>
  );
}
