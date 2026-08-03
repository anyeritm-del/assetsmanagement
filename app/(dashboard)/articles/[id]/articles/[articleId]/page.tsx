import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { ArticleForm } from "@/components/articles/ArticleForm";
import { updateArticleAction } from "@/lib/actions/articles";
import { getArticle } from "@/lib/repositories/articles";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string; articleId: string }>;
}) {
  const { id, articleId } = await params;
  const article = await getArticle(articleId);
  if (!article || article.article_group_id !== id) {
    notFound();
  }

  return (
    <FormDrawer title="Edit Article" backHref={`/articles/${id}/articles`}>
      <ArticleForm
        articleGroupId={article.article_group_id}
        article={article}
        action={updateArticleAction.bind(null, article.id)}
      />
    </FormDrawer>
  );
}
