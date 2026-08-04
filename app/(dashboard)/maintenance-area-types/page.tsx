import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { maintenanceAreaTypeColumns } from "@/components/maintenanceAreaTypes/MaintenanceAreaTypeColumns";
import { listMaintenanceAreaTypes } from "@/lib/repositories/maintenanceAreaTypes";
import { isViewOnly } from "@/lib/viewOnlyGuard";

export default async function MaintenanceAreaTypesPage() {
  const [areaTypes, viewOnly] = await Promise.all([
    listMaintenanceAreaTypes(),
    isViewOnly(),
  ]);
  const columns = viewOnly
    ? maintenanceAreaTypeColumns.filter((column) => column.id !== "actions")
    : maintenanceAreaTypeColumns;

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Maintenance Area Types" }, { label: "List" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Maintenance Area Types
        </h1>
        {!viewOnly && (
          <Link
            href="/maintenance-area-types/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        )}
      </div>
      <DataTable
        columns={columns}
        data={areaTypes}
        searchPlaceholder="e.g. filter for area type name"
        emptyMessage="No area types yet. Create one to get started."
      />
    </div>
  );
}
