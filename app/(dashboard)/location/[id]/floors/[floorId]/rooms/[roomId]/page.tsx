import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { RoomForm } from "@/components/location/RoomForm";
import { updateRoomAction } from "@/lib/actions/rooms";
import { getRoom } from "@/lib/repositories/rooms";

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string; floorId: string; roomId: string }>;
}) {
  const { id, floorId, roomId } = await params;
  const room = await getRoom(roomId);
  if (!room || room.building_id !== id || room.floor_id !== floorId) {
    notFound();
  }

  return (
    <FormDrawer title="Edit Room" backHref={`/location/${id}/floors/${floorId}/rooms`}>
      <RoomForm
        propertyId={room.property_id}
        buildingId={room.building_id}
        floorId={room.floor_id}
        room={room}
        action={updateRoomAction.bind(null, room.id)}
      />
    </FormDrawer>
  );
}
