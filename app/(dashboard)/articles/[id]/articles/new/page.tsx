import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { ArticleForm } from "@/components/articles/ArticleForm";
import { createArticleAction } from "@/lib/actions/articles";
import { getArticleGroup } from "@/lib/repositories/articleGroups";

export default async function NewArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articleGroup = await getArticleGroup(id);
  if (!articleGroup) {
    notFound();
  }

  return (
    <FormDrawer title="Create Article" backHref={`/articles/${id}/articles`}>
      <ArticleForm articleGroupId={articleGroup.id} action={createArticleAction} />
    </FormDrawer>
  );
}
