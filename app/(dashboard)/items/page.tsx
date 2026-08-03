import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ItemsTable } from "@/components/items/ItemsTable";
import { listArticles } from "@/lib/repositories/articles";
import { listBuildingsByProperty } from "@/lib/repositories/buildings";
import { listFloorsByProperty } from "@/lib/repositories/floors";
import { listItemsByProperty } from "@/lib/repositories/items";
import { listRoomsByProperty } from "@/lib/repositories/rooms";
import { listUsers } from "@/lib/repositories/users";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function ItemsPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to view its items.
      </div>
    );
  }

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
      <Breadcrumb items={[{ label: selected.name }, { label: "Items" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Items</h1>
        <Link
          href="/items/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Link>
      </div>
      <ItemsTable
        items={items}
        buildingsById={buildingsById}
        floorsById={floorsById}
        roomsById={roomsById}
        articlesById={articlesById}
        propertyId={selected.id}
        users={users}
      />
    </div>
  );
}
