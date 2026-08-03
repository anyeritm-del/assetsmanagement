"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { MaintenanceStatusBadge } from "@/components/maintenanceRequests/MaintenanceStatusBadge";
import { PriorityBadge } from "@/components/maintenanceRequests/PriorityBadge";
import type { Item, MaintenanceRequest, Property } from "@/lib/types";

type FilterValue = "all_active" | "open" | "in_progress" | "completed" | "cancelled" | "all";

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all_active", label: "All Active" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
];

interface MyJobsViewProps {
  jobs: MaintenanceRequest[];
  itemsById: Map<string, Item>;
  propertiesById: Map<string, Property>;
}

export function MyJobsView({ jobs, itemsById, propertiesById }: MyJobsViewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterValue>("all_active");

  const activeJobs = useMemo(
    () => jobs.filter((job) => job.status === "open" || job.status === "in_progress"),
    [jobs],
  );
  const totalActive = activeJobs.length;
  const critical = activeJobs.filter((job) => job.priority === "critical").length;
  const inProgress = activeJobs.filter((job) => job.status === "in_progress").length;
  const assigned = activeJobs.filter((job) => job.status === "open").length;

  const visibleJobs = useMemo(() => {
    if (filter === "all") return jobs;
    if (filter === "all_active") return activeJobs;
    return jobs.filter((job) => job.status === filter);
  }, [filter, jobs, activeJobs]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as FilterValue)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => router.refresh()}
          aria-label="Refresh"
          title="Refresh"
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl bg-blue-600 p-5 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-bold">{totalActive}</p>
            <p className="text-sm text-blue-100">Total Active</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-rose-600 p-5 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-bold">{critical}</p>
            <p className="text-sm text-rose-100">Critical</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-orange-500 p-5 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <Loader2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-bold">{inProgress}</p>
            <p className="text-sm text-orange-100">In Progress</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-emerald-700 p-5 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <UserCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-bold">{assigned}</p>
            <p className="text-sm text-emerald-100">Assigned</p>
          </div>
        </div>
      </div>

      {visibleJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            No active jobs
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleJobs.map((job) => (
            <Link
              key={job.id}
              href={`/maintenance-requests/${job.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{job.problem}</p>
                  <p className="text-xs text-slate-400">
                    {propertiesById.get(job.property_id)?.name ?? "Unknown hotel"}
                    {job.item_id
                      ? ` · ${itemsById.get(job.item_id)?.name ?? "Unknown asset"}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={job.priority} />
                  <MaintenanceStatusBadge status={job.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
