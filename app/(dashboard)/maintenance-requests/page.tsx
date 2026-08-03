import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { MaintenanceRequestsTable } from "@/components/maintenanceRequests/MaintenanceRequestsTable";
import { listBuildingsByProperty } from "@/lib/repositories/buildings";
import { listEmployees } from "@/lib/repositories/employees";
import { listMaintenanceAreaTypes } from "@/lib/repositories/maintenanceAreaTypes";
import { listMaintenanceCategories } from "@/lib/repositories/maintenanceCategories";
import { listMaintenanceRequestsByProperty } from "@/lib/repositories/maintenanceRequests";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function MaintenanceRequestsPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to view its maintenance requests.
      </div>
    );
  }

  const [requests, buildings, areaTypes, categories, employees] = await Promise.all([
    listMaintenanceRequestsByProperty(selected.id),
    listBuildingsByProperty(selected.id),
    listMaintenanceAreaTypes(),
    listMaintenanceCategories(),
    listEmployees(),
  ]);
  const buildingsById = new Map(buildings.map((building) => [building.id, building]));
  const areaTypesById = new Map(areaTypes.map((areaType) => [areaType.id, areaType]));
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const employeesById = new Map(employees.map((employee) => [employee.id, employee]));

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: selected.name }, { label: "Maintenance Requests" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Maintenance Requests
        </h1>
        <Link
          href="/maintenance-requests/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Maintenance Request
        </Link>
      </div>
      <MaintenanceRequestsTable
        requests={requests}
        buildingsById={buildingsById}
        areaTypesById={areaTypesById}
        categoriesById={categoriesById}
        employeesById={employeesById}
      />
    </div>
  );
}
