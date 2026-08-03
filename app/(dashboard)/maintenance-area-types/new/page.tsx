import { FormDrawer } from "@/components/ui/FormDrawer";
import { MaintenanceAreaTypeForm } from "@/components/maintenanceAreaTypes/MaintenanceAreaTypeForm";
import { createMaintenanceAreaTypeAction } from "@/lib/actions/maintenanceAreaTypes";

export default function NewMaintenanceAreaTypePage() {
  return (
    <FormDrawer title="Create Maintenance Area Type" backHref="/maintenance-area-types">
      <MaintenanceAreaTypeForm action={createMaintenanceAreaTypeAction} />
    </FormDrawer>
  );
}
