"use server";

import { revalidatePath } from "next/cache";
import { articleInputSchema } from "../validation/article";
import { createArticle, updateArticle } from "../repositories/articles";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseArticleForm(formData: FormData) {
  return articleInputSchema.safeParse({
    article_group_id: formData.get("article_group_id"),
    name: formData.get("name"),
    code: formData.get("code"),
    unit: formData.get("unit"),
    content: formData.get("content"),
  });
}

export async function createArticleAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseArticleForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createArticle(parsed.data);
  revalidatePath(`/articles/${parsed.data.article_group_id}/articles`);
  return { success: true };
}

export async function updateArticleAction(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseArticleForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updateArticle(id, parsed.data);
  revalidatePath(`/articles/${parsed.data.article_group_id}/articles`);
  return { success: true };
}
