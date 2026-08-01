import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { ItemForm } from "@/components/items/ItemForm";
import { updateItemAction } from "@/lib/actions/items";
import { getItem } from "@/lib/repositories/items";
import { listBuildingsByProperty } from "@/lib/repositories/buildings";

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

  const buildings = await listBuildingsByProperty(item.property_id);

  return (
    <FormDrawer title="Edit Item" backHref="/items">
      <ItemForm
        propertyId={item.property_id}
        buildings={buildings}
        item={item}
        action={updateItemAction.bind(null, item.id)}
      />
    </FormDrawer>
  );
}
