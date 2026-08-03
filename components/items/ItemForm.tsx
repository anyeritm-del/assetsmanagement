"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { ITEM_STATUSES, ITEM_STATUS_LABELS, ITEM_TYPES, ITEM_TYPE_LABELS } from "@/lib/constants";
import type {
  Article,
  ArticleGroup,
  Building,
  Department,
  Employee,
  Equipment,
  Floor,
  Item,
  PurchaseOrder,
  Room,
} from "@/lib/types";
import type { ActionResult } from "@/lib/actions/items";
import { PhotoUploadField } from "@/components/ui/PhotoUploadField";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface ItemFormProps {
  propertyId: string;
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];
  departments: Department[];
  equipmentList: Equipment[];
  articleGroups: ArticleGroup[];
  articles: Article[];
  employees: Employee[];
  purchaseOrders: PurchaseOrder[];
  item?: Item;
  action: (formData: FormData) => Promise<ActionResult>;
}

export function ItemForm({
  propertyId,
  buildings,
  floors,
  rooms,
  departments,
  equipmentList,
  articleGroups,
  articles,
  employees,
  purchaseOrders,
  item,
  action,
}: ItemFormProps) {
  const router = useRouter();
  const initialRoom = rooms.find((room) => room.id === item?.room_id);
  const initialFloorId = initialRoom?.floor_id ?? "";
  const initialArticle = articles.find((article) => article.id === item?.article_id);

  const [buildingId, setBuildingId] = useState(item?.building_id ?? buildings[0]?.id ?? "");
  const [floorId, setFloorId] = useState(initialFloorId);
  const [roomId, setRoomId] = useState(item?.room_id ?? "");
  const [articleGroupId, setArticleGroupId] = useState(initialArticle?.article_group_id ?? "");
  const [articleId, setArticleId] = useState(item?.article_id ?? "");

  const floorsForBuilding = floors.filter((floor) => floor.building_id === buildingId);
  const roomsForFloor = rooms.filter((room) => room.floor_id === floorId);
  const articlesForGroup = articles.filter((article) => article.article_group_id === articleGroupId);

  function handleBuildingChange(newBuildingId: string) {
    setBuildingId(newBuildingId);
    // Dropping the floor/room when they no longer belong to the newly selected building avoids
    // silently saving an item whose room points at a different building.
    setFloorId((prevFloorId) => {
      const stillValid = floors.some(
        (floor) => floor.id === prevFloorId && floor.building_id === newBuildingId,
      );
      if (!stillValid) {
        setRoomId("");
        return "";
      }
      return prevFloorId;
    });
  }

  function handleFloorChange(newFloorId: string) {
    setFloorId(newFloorId);
    // Same reasoning one level down: a room from the previous floor no longer applies.
    setRoomId((prevRoomId) =>
      rooms.some((room) => room.id === prevRoomId && room.floor_id === newFloorId)
        ? prevRoomId
        : "",
    );
  }

  function handleArticleGroupChange(newArticleGroupId: string) {
    setArticleGroupId(newArticleGroupId);
    setArticleId((prevArticleId) =>
      articles.some(
        (article) => article.id === prevArticleId && article.article_group_id === newArticleGroupId,
      )
        ? prevArticleId
        : "",
    );
  }

  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result.success) {
        router.push("/items");
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="property_id" value={propertyId} />

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Purchase Order
        </label>
        <div className="mt-1">
          <SearchableSelect
            name="purchase_order_id"
            options={purchaseOrders.map((po) => ({
              id: po.id,
              label: po.purchase_number || po.title,
            }))}
            defaultValue={item?.purchase_order_id}
            placeholder="Start typing to search Purchase Order"
            emptyLabel="No purchase order"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Item Name
        </label>
        <input
          name="name"
          defaultValue={item?.name}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Building
          </label>
          <select
            name="building_id"
            value={buildingId}
            onChange={(event) => handleBuildingChange(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Floor
          </label>
          <select
            value={floorId}
            onChange={(event) => handleFloorChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">Select a floor</option>
            {floorsForBuilding.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.name}
              </option>
            ))}
          </select>
          {floorsForBuilding.length === 0 && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              This building has no floors yet.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Room
          </label>
          <select
            name="room_id"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            disabled={!floorId}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">No room</option>
            {roomsForFloor.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
          {floorId && roomsForFloor.length === 0 && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              This floor has no rooms yet.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Department
          </label>
          <select
            name="department_id"
            defaultValue={item?.department_id ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">No department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Equipment
          </label>
          <select
            name="equipment_id"
            defaultValue={item?.equipment_id ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">No equipment</option>
            {equipmentList.map((equipment) => (
              <option key={equipment.id} value={equipment.id}>
                {equipment.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Article Group
          </label>
          <select
            value={articleGroupId}
            onChange={(event) => handleArticleGroupChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">Select a group</option>
            {articleGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Article
          </label>
          <select
            name="article_id"
            value={articleId}
            onChange={(event) => setArticleId(event.target.value)}
            disabled={!articleGroupId}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">No article</option>
            {articlesForGroup.map((article) => (
              <option key={article.id} value={article.id}>
                {article.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Category
          </label>
          <input
            name="category"
            defaultValue={item?.category}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Code / SKU
          </label>
          <input
            name="code"
            defaultValue={item?.code}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Serial Number
          </label>
          <input
            name="serial_number"
            defaultValue={item?.serial_number}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Brand
          </label>
          <input
            name="brand"
            defaultValue={item?.brand}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Type
          </label>
          <select
            name="item_type"
            defaultValue={item?.item_type ?? "fixed_asset"}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            {ITEM_TYPES.map((type) => (
              <option key={type} value={type}>
                {ITEM_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Quantity
          </label>
          <input
            type="number"
            min={0}
            name="quantity"
            defaultValue={item?.quantity ?? 1}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Status
          </label>
          <select
            name="status"
            defaultValue={item?.status ?? "active"}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            {ITEM_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ITEM_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Acquisition Value
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            name="acquisition_value"
            defaultValue={item?.acquisition_value ?? 0}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Book Value
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            name="book_value"
            defaultValue={item?.book_value ?? 0}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Lifetime (in year)
          </label>
          <input
            type="number"
            min={0}
            name="lifetime_years"
            defaultValue={item?.lifetime_years ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            End of Lifetime Date
          </label>
          <input
            type="date"
            name="end_of_lifetime_date"
            defaultValue={item?.end_of_lifetime_date ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Warranty (months)
          </label>
          <input
            type="number"
            min={0}
            name="warranty_months"
            defaultValue={item?.warranty_months ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Assigned Employee
        </label>
        <select
          name="assigned_employee_id"
          defaultValue={item?.assigned_employee_id ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">Not assigned</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Description
        </label>
        <textarea
          name="notes"
          defaultValue={item?.notes}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <PhotoUploadField
        existingPhotoUrl={item?.photo_drive_file_id ? `/api/photo/${item.photo_drive_file_id}` : null}
      />

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}

      {buildings.length === 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Create a building in the Location module first before adding items.
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/items")}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || buildings.length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
