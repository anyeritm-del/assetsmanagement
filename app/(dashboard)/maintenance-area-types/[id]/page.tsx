import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { MaintenanceAreaTypeForm } from "@/components/maintenanceAreaTypes/MaintenanceAreaTypeForm";
import { updateMaintenanceAreaTypeAction } from "@/lib/actions/maintenanceAreaTypes";
import { getMaintenanceAreaType } from "@/lib/repositories/maintenanceAreaTypes";

export default async function EditMaintenanceAreaTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const areaType = await getMaintenanceAreaType(id);
  if (!areaType) {
    notFound();
  }

  return (
    <FormDrawer title="Edit Maintenance Area Type" backHref="/maintenance-area-types">
      <MaintenanceAreaTypeForm
        areaType={areaType}
        action={updateMaintenanceAreaTypeAction.bind(null, areaType.id)}
      />
    </FormDrawer>
  );
}
