import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PMSchedulesTable } from "@/components/pmSchedules/PMSchedulesTable";
import { RunPMCheckButton } from "@/components/pmSchedules/RunPMCheckButton";
import { canManageMaintenance } from "@/lib/maintenanceAuth";
import { getPMScheduleDueStatus } from "@/lib/pmScheduleStatus";
import { listItemsByProperty } from "@/lib/repositories/items";
import { listPMSchedulesByProperty } from "@/lib/repositories/pmSchedules";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";
import { isViewOnly } from "@/lib/viewOnlyGuard";

export default async function PreventiveMaintenancePage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to view its preventive maintenance schedules.
      </div>
    );
  }

  const [schedules, items, allowed, viewOnly] = await Promise.all([
    listPMSchedulesByProperty(selected.id),
    listItemsByProperty(selected.id),
    canManageMaintenance(),
    isViewOnly(),
  ]);
  const itemsById = new Map(items.map((item) => [item.id, item]));

  const overdueCount = schedules.filter((s) => getPMScheduleDueStatus(s) === "overdue").length;
  const dueSoonCount = schedules.filter((s) => getPMScheduleDueStatus(s) === "due_soon").length;
  const upcomingCount = schedules.filter((s) => getPMScheduleDueStatus(s) === "upcoming").length;

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: selected.name }, { label: "Preventive Maintenance" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Preventive Maintenance
        </h1>
        <div className="flex items-center gap-3">
          {!viewOnly &&
            (allowed ? (
              <RunPMCheckButton propertyId={selected.id} />
            ) : (
              <button
                type="button"
                disabled
                title="You don't have permission to run PM Check. Ask an administrator to grant you &quot;Can Manage Maintenance&quot; in Users."
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-400 dark:border-slate-700 dark:text-slate-600"
              >
                Run PM Check
              </button>
            ))}
          {!viewOnly && (
            <Link
              href="/preventive-maintenance/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Schedule
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {schedules.length}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Total Schedules</p>
        </div>
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-rose-500 bg-white p-5 text-center dark:border-slate-800 dark:border-l-rose-500 dark:bg-slate-900">
          <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{overdueCount}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Overdue</p>
        </div>
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-400 bg-white p-5 text-center dark:border-slate-800 dark:border-l-amber-400 dark:bg-slate-900">
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{dueSoonCount}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Due in 30 Days</p>
        </div>
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-5 text-center dark:border-slate-800 dark:border-l-emerald-500 dark:bg-slate-900">
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {upcomingCount}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upcoming</p>
        </div>
      </div>

      <PMSchedulesTable schedules={schedules} itemsById={itemsById} viewOnly={viewOnly} />
    </div>
  );
}
