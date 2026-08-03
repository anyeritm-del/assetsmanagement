"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { runPMCheckAction } from "@/lib/actions/pmSchedules";

export function RunPMCheckButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    setMessage(null);
    startTransition(async () => {
      const result = await runPMCheckAction(propertyId);
      if (!result.success) {
        setMessage(result.error ?? "Failed to run PM check");
        return;
      }
      setMessage(
        `Created ${result.createdCount ?? 0} maintenance request(s)` +
          (result.skippedCount ? `, ${result.skippedCount} already had an open ticket` : "."),
      );
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-500/10"
      >
        <Play className="h-4 w-4" />
        {isPending ? "Running..." : "Run PM Check"}
      </button>
      {message && (
        <p className="absolute right-0 top-full z-10 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-600 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {message}
        </p>
      )}
    </div>
  );
}
