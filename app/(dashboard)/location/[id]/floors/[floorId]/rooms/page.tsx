import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { roomColumns } from "@/components/location/RoomColumns";
import { getBuilding } from "@/lib/repositories/buildings";
import { getFloor } from "@/lib/repositories/floors";
import { getProperty } from "@/lib/repositories/properties";
import { listRoomsByFloor } from "@/lib/repositories/rooms";
import { isViewOnly } from "@/lib/viewOnlyGuard";

export default async function RoomsPage({
  params,
}: {
  params: Promise<{ id: string; floorId: string }>;
}) {
  const { id, floorId } = await params;
  const floor = await getFloor(floorId);
  if (!floor || floor.building_id !== id) {
    notFound();
  }

  const [building, property, rooms, viewOnly] = await Promise.all([
    getBuilding(id),
    getProperty(floor.property_id),
    listRoomsByFloor(floorId),
    isViewOnly(),
  ]);
  const columns = viewOnly
    ? roomColumns.filter((column) => column.id !== "actions")
    : roomColumns;

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: property?.name ?? "Property", href: "/location" },
          { label: building?.name ?? "Building", href: `/location/${id}/floors` },
          { label: floor.name },
        ]}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Room</h1>
        {!viewOnly && (
          <Link
            href={`/location/${id}/floors/${floorId}/rooms/new`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        )}
      </div>
      <DataTable
        columns={columns}
        data={rooms}
        searchPlaceholder="e.g. filter for room name, etc"
        emptyMessage="No rooms yet. Create one to get started."
      />
    </div>
  );
}
