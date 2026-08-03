import { FormDrawer } from "@/components/ui/FormDrawer";
import { ArticleGroupForm } from "@/components/articles/ArticleGroupForm";
import { createArticleGroupAction } from "@/lib/actions/articleGroups";

export default function NewArticleGroupPage() {
  return (
    <FormDrawer title="Create Article Group" backHref="/articles">
      <ArticleGroupForm action={createArticleGroupAction} />
    </FormDrawer>
  );
}
