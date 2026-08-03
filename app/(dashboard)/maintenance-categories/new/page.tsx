import { FormDrawer } from "@/components/ui/FormDrawer";
import { MaintenanceCategoryForm } from "@/components/maintenanceCategories/MaintenanceCategoryForm";
import { createMaintenanceCategoryAction } from "@/lib/actions/maintenanceCategories";

export default function NewMaintenanceCategoryPage() {
  return (
    <FormDrawer title="Create Maintenance Category" backHref="/maintenance-categories">
      <MaintenanceCategoryForm action={createMaintenanceCategoryAction} />
    </FormDrawer>
  );
}
