import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { createFloorColumns } from "@/components/location/FloorColumns";
import { getBuilding } from "@/lib/repositories/buildings";
import { getProperty } from "@/lib/repositories/properties";
import { listFloorsByBuilding } from "@/lib/repositories/floors";
import { isViewOnly } from "@/lib/viewOnlyGuard";

export default async function FloorsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const building = await getBuilding(id);
  if (!building) {
    notFound();
  }

  const [property, floors, viewOnly] = await Promise.all([
    getProperty(building.property_id),
    listFloorsByBuilding(id),
    isViewOnly(),
  ]);
  const columns = createFloorColumns(viewOnly);

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: property?.name ?? "Property", href: "/location" },
          { label: building.name },
        ]}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Floor</h1>
        {!viewOnly && (
          <Link
            href={`/location/${id}/floors/new`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        )}
      </div>
      <DataTable
        columns={columns}
        data={floors}
        searchPlaceholder="e.g. filter for floor name, etc"
        emptyMessage="No floors yet. Create one to get started."
      />
    </div>
  );
}
