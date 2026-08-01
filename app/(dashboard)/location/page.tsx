import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { buildingColumns } from "@/components/location/BuildingColumns";
import { listBuildingsByProperty } from "@/lib/repositories/buildings";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function LocationPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to view its buildings.
      </div>
    );
  }

  const buildings = await listBuildingsByProperty(selected.id);

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: selected.name }, { label: "Buildings (Blocks)" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Location</h1>
        <Link
          href="/location/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Link>
      </div>
      <DataTable
        columns={buildingColumns}
        data={buildings}
        searchPlaceholder="e.g. filter for building name, block, etc"
        emptyMessage="No buildings yet. Create one to get started."
      />
    </div>
  );
}
