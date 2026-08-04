"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import type { ApprovalStageStatus } from "@/lib/constants";
import type { OutgoingRecord } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/outgoingRecords";
import { getActiveStage } from "@/lib/outgoingRecordStatus";

interface StageInfo {
  key: "fc" | "hr" | "gm";
  label: string;
  status: ApprovalStageStatus;
  decidedBy: string | null;
  decidedAt: string | null;
  notes: string;
}

interface ApprovalPanelProps {
  record: OutgoingRecord;
  decideAction: (
    id: string,
    stage: "fc" | "hr" | "gm",
    formData: FormData,
  ) => Promise<ActionResult>;
  viewOnly?: boolean;
}

function StageIcon({ status }: { status: ApprovalStageStatus }) {
  if (status === "approved") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  if (status === "rejected") return <XCircle className="h-5 w-5 text-rose-600" />;
  return <Circle className="h-5 w-5 text-slate-300" />;
}

function DecisionForm({
  recordId,
  stage,
  decideAction,
}: {
  recordId: string;
  stage: "fc" | "hr" | "gm";
  decideAction: ApprovalPanelProps["decideAction"];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await decideAction(recordId, stage, formData);
      if (result.success) {
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <textarea
        name="notes"
        rows={2}
        placeholder="Optional notes"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
      />
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

export function ApprovalPanel({ record, decideAction, viewOnly = false }: ApprovalPanelProps) {
  const activeStage = getActiveStage(record);

  const stages: StageInfo[] = [
    {
      key: "fc",
      label: "Financial Controller",
      status: record.fc_status,
      decidedBy: record.fc_decided_by,
      decidedAt: record.fc_decided_at,
      notes: record.fc_notes,
    },
    {
      key: "hr",
      label: "Human Resources",
      status: record.hr_status,
      decidedBy: record.hr_decided_by,
      decidedAt: record.hr_decided_at,
      notes: record.hr_notes,
    },
    {
      key: "gm",
      label: "General Manager",
      status: record.gm_status,
      decidedBy: record.gm_decided_by,
      decidedAt: record.gm_decided_at,
      notes: record.gm_notes,
    },
  ];

  return (
    <div className="space-y-4">
      {stages.map((stage) => (
        <div
          key={stage.key}
          className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
        >
          <div className="flex items-start gap-3">
            <StageIcon status={stage.status} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {stage.label}
              </p>
              {stage.status === "pending" ? (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {activeStage === stage.key ? "Awaiting decision" : "Waiting on a prior stage"}
                </p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stage.status === "approved" ? "Approved" : "Rejected"} by {stage.decidedBy}
                  {stage.decidedAt ? ` on ${new Date(stage.decidedAt).toLocaleString()}` : ""}
                </p>
              )}
              {stage.notes && (
                <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">
                  &ldquo;{stage.notes}&rdquo;
                </p>
              )}
              {activeStage === stage.key && !viewOnly && (
                <DecisionForm recordId={record.id} stage={stage.key} decideAction={decideAction} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
