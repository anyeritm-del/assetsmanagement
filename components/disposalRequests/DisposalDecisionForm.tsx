"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/actions/disposalRequests";

interface DisposalDecisionFormProps {
  requestId: string;
  action: (id: string, formData: FormData) => Promise<ActionResult>;
}

export function DisposalDecisionForm({ requestId, action }: DisposalDecisionFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(requestId, formData);
      if (result.success) {
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          name="decision"
          value="approved"
          disabled={isPending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="rejected"
          disabled={isPending}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </form>
  );
}
