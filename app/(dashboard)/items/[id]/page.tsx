import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer } from "lucide-react";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { ItemForm } from "@/components/items/ItemForm";
import { updateItemAction } from "@/lib/actions/items";
import { getItem } from "@/lib/repositories/items";
import { listArticleGroups } from "@/lib/repositories/articleGroups";
import { listArticles } from "@/lib/repositories/articles";
import { listBuildingsByProperty } from "@/lib/repositories/buildings";
import { listDepartments } from "@/lib/repositories/departments";
import { listEmployees } from "@/lib/repositories/employees";
import { listEquipment } from "@/lib/repositories/equipment";
import { listFloorsByProperty } from "@/lib/repositories/floors";
import { listPurchaseOrdersByProperty } from "@/lib/repositories/purchaseOrders";
import { listRoomsByProperty } from "@/lib/repositories/rooms";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) {
    notFound();
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
    listBuildingsByProperty(item.property_id),
    listFloorsByProperty(item.property_id),
    listRoomsByProperty(item.property_id),
    listDepartments(),
    listEquipment(),
    listArticleGroups(),
    listArticles(),
    listEmployees(),
    listPurchaseOrdersByProperty(item.property_id),
  ]);

  return (
    <FormDrawer
      title="Edit Item"
      backHref="/items"
      actions={
        <Link
          href={`/items/${item.id}/label`}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Printer className="h-4 w-4" />
          Print Label
        </Link>
      }
    >
      <ItemForm
        propertyId={item.property_id}
        buildings={buildings}
        floors={floors}
        rooms={rooms}
        departments={departments}
        equipmentList={equipmentList}
        articleGroups={articleGroups}
        articles={articles}
        employees={employees}
        purchaseOrders={purchaseOrders}
        item={item}
        action={updateItemAction.bind(null, item.id)}
      />
    </FormDrawer>
  );
}
