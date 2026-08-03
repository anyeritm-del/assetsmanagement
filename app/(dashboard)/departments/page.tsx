import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { departmentColumns } from "@/components/departments/DepartmentColumns";
import { listDepartments } from "@/lib/repositories/departments";

export default async function DepartmentsPage() {
  const departments = await listDepartments();

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Item Department" }, { label: "List" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Item Departments
        </h1>
        <Link
          href="/departments/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Link>
      </div>
      <DataTable
        columns={departmentColumns}
        data={departments}
        searchPlaceholder="e.g. filter for department name, etc"
        emptyMessage="No departments yet. Create one to get started."
      />
    </div>
  );
}
