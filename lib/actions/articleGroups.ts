"use server";

import { revalidatePath } from "next/cache";
import { articleGroupInputSchema } from "../validation/articleGroup";
import { createArticleGroup, updateArticleGroup } from "../repositories/articleGroups";
import { assertCanMutate } from "../viewOnlyGuard";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseArticleGroupForm(formData: FormData) {
  return articleGroupInputSchema.safeParse({
    name: formData.get("name"),
  });
}

export async function createArticleGroupAction(formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseArticleGroupForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createArticleGroup(parsed.data);
  revalidatePath("/articles");
  return { success: true };
}

export async function updateArticleGroupAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseArticleGroupForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updateArticleGroup(id, parsed.data);
  revalidatePath("/articles");
  return { success: true };
}
