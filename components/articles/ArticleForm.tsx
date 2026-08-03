"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/articles";

interface ArticleFormProps {
  articleGroupId: string;
  article?: Article;
  action: (formData: FormData) => Promise<ActionResult>;
}

export function ArticleForm({ articleGroupId, article, action }: ArticleFormProps) {
  const router = useRouter();
  const backHref = `/articles/${articleGroupId}/articles`;
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result.success) {
        router.push(backHref);
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="article_group_id" value={articleGroupId} />

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Article Name
        </label>
        <input
          name="name"
          defaultValue={article?.name}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Article Code
        </label>
        <input
          name="code"
          defaultValue={article?.code}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Unit
          </label>
          <input
            name="unit"
            defaultValue={article?.unit}
            placeholder="e.g. Pcs, Set, Unit"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Content
          </label>
          <input
            type="number"
            min={0}
            name="content"
            defaultValue={article?.content ?? 1}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
