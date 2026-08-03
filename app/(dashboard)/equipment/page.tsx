import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { equipmentColumns } from "@/components/equipment/EquipmentColumns";
import { listEquipment } from "@/lib/repositories/equipment";

export default async function EquipmentPage() {
  const equipment = await listEquipment();

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Equipments" }, { label: "List" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Equipments</h1>
        <Link
          href="/equipment/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Link>
      </div>
      <DataTable
        columns={equipmentColumns}
        data={equipment}
        searchPlaceholder="e.g. filter for equipment name, etc"
        emptyMessage="No equipment yet. Create one to get started."
      />
    </div>
  );
}
