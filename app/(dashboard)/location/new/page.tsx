import { redirect } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { BuildingForm } from "@/components/location/BuildingForm";
import { createBuildingAction } from "@/lib/actions/buildings";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function NewBuildingPage() {
  const { selected } = await getSelectedPropertyContext();
  if (!selected) {
    redirect("/location");
  }

  return (
    <FormDrawer title="Create Building" backHref="/location">
      <BuildingForm propertyId={selected.id} action={createBuildingAction} />
    </FormDrawer>
  );
}
