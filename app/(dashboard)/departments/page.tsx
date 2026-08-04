import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { departmentColumns } from "@/components/departments/DepartmentColumns";
import { listDepartments } from "@/lib/repositories/departments";
import { isViewOnly } from "@/lib/viewOnlyGuard";

export default async function DepartmentsPage() {
  const [departments, viewOnly] = await Promise.all([listDepartments(), isViewOnly()]);
  const columns = viewOnly
    ? departmentColumns.filter((column) => column.id !== "actions")
    : departmentColumns;

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Item Department" }, { label: "List" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Item Departments
        </h1>
        {!viewOnly && (
          <Link
            href="/departments/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        )}
      </div>
      <DataTable
        columns={columns}
        data={departments}
        searchPlaceholder="e.g. filter for department name, etc"
        emptyMessage="No departments yet. Create one to get started."
      />
    </div>
  );
}
