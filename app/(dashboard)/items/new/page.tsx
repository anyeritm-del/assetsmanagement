import { redirect } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { ItemForm } from "@/components/items/ItemForm";
import { createItemAction } from "@/lib/actions/items";
import { listBuildingsByProperty } from "@/lib/repositories/buildings";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function NewItemPage() {
  const { selected } = await getSelectedPropertyContext();
  if (!selected) {
    redirect("/items");
  }

  const buildings = await listBuildingsByProperty(selected.id);

  return (
    <FormDrawer title="Create Item" backHref="/items">
      <ItemForm propertyId={selected.id} buildings={buildings} action={createItemAction} />
    </FormDrawer>
  );
}
