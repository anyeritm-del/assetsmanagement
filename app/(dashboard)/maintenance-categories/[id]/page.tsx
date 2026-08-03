import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { MaintenanceCategoryForm } from "@/components/maintenanceCategories/MaintenanceCategoryForm";
import { updateMaintenanceCategoryAction } from "@/lib/actions/maintenanceCategories";
import { getMaintenanceCategory } from "@/lib/repositories/maintenanceCategories";

export default async function EditMaintenanceCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getMaintenanceCategory(id);
  if (!category) {
    notFound();
  }

  return (
    <FormDrawer title="Edit Maintenance Category" backHref="/maintenance-categories">
      <MaintenanceCategoryForm
        category={category}
        action={updateMaintenanceCategoryAction.bind(null, category.id)}
      />
    </FormDrawer>
  );
}
