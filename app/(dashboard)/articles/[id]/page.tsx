import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { ArticleGroupForm } from "@/components/articles/ArticleGroupForm";
import { updateArticleGroupAction } from "@/lib/actions/articleGroups";
import { getArticleGroup } from "@/lib/repositories/articleGroups";

export default async function EditArticleGroupPage({
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
    <FormDrawer title="Edit Article Group" backHref="/articles">
      <ArticleGroupForm
        articleGroup={articleGroup}
        action={updateArticleGroupAction.bind(null, articleGroup.id)}
      />
    </FormDrawer>
  );
}
