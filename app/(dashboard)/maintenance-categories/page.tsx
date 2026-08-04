import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { maintenanceCategoryColumns } from "@/components/maintenanceCategories/MaintenanceCategoryColumns";
import { listMaintenanceCategories } from "@/lib/repositories/maintenanceCategories";
import { isViewOnly } from "@/lib/viewOnlyGuard";

export default async function MaintenanceCategoriesPage() {
  const [categories, viewOnly] = await Promise.all([
    listMaintenanceCategories(),
    isViewOnly(),
  ]);
  const columns = viewOnly
    ? maintenanceCategoryColumns.filter((column) => column.id !== "actions")
    : maintenanceCategoryColumns;

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Maintenance Categories" }, { label: "List" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Maintenance Categories
        </h1>
        {!viewOnly && (
          <Link
            href="/maintenance-categories/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        )}
      </div>
      <DataTable
        columns={columns}
        data={categories}
        searchPlaceholder="e.g. filter for category name"
        emptyMessage="No maintenance categories yet. Create one to get started."
      />
    </div>
  );
}
