import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { articleColumns } from "@/components/articles/ArticleColumns";
import { getArticleGroup } from "@/lib/repositories/articleGroups";
import { listArticlesByGroup } from "@/lib/repositories/articles";

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articleGroup = await getArticleGroup(id);
  if (!articleGroup) {
    notFound();
  }

  const articles = await listArticlesByGroup(id);

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Articles", href: "/articles" }, { label: articleGroup.name }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Article</h1>
        <Link
          href={`/articles/${id}/articles/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Link>
      </div>
      <DataTable
        columns={articleColumns}
        data={articles}
        searchPlaceholder="e.g. filter for article name, etc"
        emptyMessage="No articles yet. Create one to get started."
      />
    </div>
  );
}
