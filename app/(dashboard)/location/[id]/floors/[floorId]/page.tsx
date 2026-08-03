import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { FloorForm } from "@/components/location/FloorForm";
import { updateFloorAction } from "@/lib/actions/floors";
import { getFloor } from "@/lib/repositories/floors";

export default async function EditFloorPage({
  params,
}: {
  params: Promise<{ id: string; floorId: string }>;
}) {
  const { id, floorId } = await params;
  const floor = await getFloor(floorId);
  if (!floor || floor.building_id !== id) {
    notFound();
  }

  return (
    <FormDrawer title="Edit Floor" backHref={`/location/${id}/floors`}>
      <FloorForm
        propertyId={floor.property_id}
        buildingId={floor.building_id}
        floor={floor}
        action={updateFloorAction.bind(null, floor.id)}
      />
    </FormDrawer>
  );
}
