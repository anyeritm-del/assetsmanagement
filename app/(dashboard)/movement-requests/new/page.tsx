import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { MovementItemPicker } from "@/components/movementRequests/MovementItemPicker";
import { listArticles } from "@/lib/repositories/articles";
import { listBuildingsByProperty } from "@/lib/repositories/buildings";
import { listFloorsByProperty } from "@/lib/repositories/floors";
import { listItemsByProperty } from "@/lib/repositories/items";
import { listRoomsByProperty } from "@/lib/repositories/rooms";
import { listUsers } from "@/lib/repositories/users";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function NewMovementRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ itemId?: string }>;
}) {
  const { selected } = await getSelectedPropertyContext();
  if (!selected) {
    redirect("/movement-requests");
  }
  const { itemId } = await searchParams;

  const [items, buildings, floors, rooms, articles, users] = await Promise.all([
    listItemsByProperty(selected.id),
    listBuildingsByProperty(selected.id),
    listFloorsByProperty(selected.id),
    listRoomsByProperty(selected.id),
    listArticles(),
    listUsers(),
  ]);
  const buildingsById = new Map(buildings.map((building) => [building.id, building]));
  const floorsById = new Map(floors.map((floor) => [floor.id, floor]));
  const roomsById = new Map(rooms.map((room) => [room.id, room]));
  const articlesById = new Map(articles.map((article) => [article.id, article]));

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: selected.name }, { label: "Item Movement" }, { label: "Create" }]} />
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Create Movement Request
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Select one or more items below, then request a move to a new building/floor/location
        within {selected.name}.
      </p>
      <MovementItemPicker
        items={items}
        buildings={buildings}
        floors={floors}
        rooms={rooms}
        articlesById={articlesById}
        buildingsById={buildingsById}
        floorsById={floorsById}
        roomsById={roomsById}
        propertyId={selected.id}
        users={users}
        preselectedItemId={itemId}
      />
    </div>
  );
}
