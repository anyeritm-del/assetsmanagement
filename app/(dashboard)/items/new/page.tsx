import { redirect } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { ItemForm } from "@/components/items/ItemForm";
import { createItemAction } from "@/lib/actions/items";
import { listArticleGroups } from "@/lib/repositories/articleGroups";
import { listArticles } from "@/lib/repositories/articles";
import { listBuildingsByProperty } from "@/lib/repositories/buildings";
import { listDepartments } from "@/lib/repositories/departments";
import { listEmployees } from "@/lib/repositories/employees";
import { listEquipment } from "@/lib/repositories/equipment";
import { listFloorsByProperty } from "@/lib/repositories/floors";
import { listPurchaseOrdersByProperty } from "@/lib/repositories/purchaseOrders";
import { listRoomsByProperty } from "@/lib/repositories/rooms";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function NewItemPage() {
  const { selected } = await getSelectedPropertyContext();
  if (!selected) {
    redirect("/items");
  }

  const [
    buildings,
    floors,
    rooms,
    departments,
    equipmentList,
    articleGroups,
    articles,
    employees,
    purchaseOrders,
  ] = await Promise.all([
    listBuildingsByProperty(selected.id),
    listFloorsByProperty(selected.id),
    listRoomsByProperty(selected.id),
    listDepartments(),
    listEquipment(),
    listArticleGroups(),
    listArticles(),
    listEmployees(),
    listPurchaseOrdersByProperty(selected.id),
  ]);

  return (
    <FormDrawer title="Create Item" backHref="/items">
      <ItemForm
        propertyId={selected.id}
        buildings={buildings}
        floors={floors}
        rooms={rooms}
        departments={departments}
        equipmentList={equipmentList}
        articleGroups={articleGroups}
        articles={articles}
        employees={employees}
        purchaseOrders={purchaseOrders}
        action={createItemAction}
      />
    </FormDrawer>
  );
}
