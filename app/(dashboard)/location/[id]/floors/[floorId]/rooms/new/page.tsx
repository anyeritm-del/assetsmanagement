import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { RoomForm } from "@/components/location/RoomForm";
import { createRoomAction } from "@/lib/actions/rooms";
import { getFloor } from "@/lib/repositories/floors";

export default async function NewRoomPage({
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
    <FormDrawer title="Create Room" backHref={`/location/${id}/floors/${floorId}/rooms`}>
      <RoomForm
        propertyId={floor.property_id}
        buildingId={floor.building_id}
        floorId={floor.id}
        action={createRoomAction}
      />
    </FormDrawer>
  );
}
