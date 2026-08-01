import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { BuildingForm } from "@/components/location/BuildingForm";
import { updateBuildingAction } from "@/lib/actions/buildings";
import { getBuilding } from "@/lib/repositories/buildings";

export default async function EditBuildingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const building = await getBuilding(id);
  if (!building) {
    notFound();
  }

  return (
    <FormDrawer title="Edit Building" backHref="/location">
      <BuildingForm
        propertyId={building.property_id}
        building={building}
        action={updateBuildingAction.bind(null, building.id)}
      />
    </FormDrawer>
  );
}
