import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { FloorForm } from "@/components/location/FloorForm";
import { createFloorAction } from "@/lib/actions/floors";
import { getBuilding } from "@/lib/repositories/buildings";

export default async function NewFloorPage({
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
    <FormDrawer title="Create Floor" backHref={`/location/${id}/floors`}>
      <FloorForm
        propertyId={building.property_id}
        buildingId={building.id}
        action={createFloorAction}
      />
    </FormDrawer>
  );
}
