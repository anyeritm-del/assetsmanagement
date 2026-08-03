import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { employeeColumns } from "@/components/employees/EmployeeColumns";
import { listEmployees } from "@/lib/repositories/employees";

export default async function EmployeesPage() {
  const employees = await listEmployees();

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Employees" }, { label: "List" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Employees</h1>
        <Link
          href="/employees/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Link>
      </div>
      <DataTable
        columns={employeeColumns}
        data={employees}
        searchPlaceholder="e.g. filter for employee name, etc"
        emptyMessage="No employees yet. Create one to get started."
      />
    </div>
  );
}
