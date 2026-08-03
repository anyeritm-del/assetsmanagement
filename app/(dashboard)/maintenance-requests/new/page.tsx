import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { MaintenanceRequestForm } from "@/components/maintenanceRequests/MaintenanceRequestForm";
import { createMaintenanceRequestAction } from "@/lib/actions/maintenanceRequests";
import { listBuildingsByProperty } from "@/lib/repositories/buildings";
import { listDepartments } from "@/lib/repositories/departments";
import { listFloorsByProperty } from "@/lib/repositories/floors";
import { listItemsByProperty } from "@/lib/repositories/items";
import { listMaintenanceAreaTypes } from "@/lib/repositories/maintenanceAreaTypes";
import { listMaintenanceCategories } from "@/lib/repositories/maintenanceCategories";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function NewMaintenanceRequestPage() {
  const { selected } = await getSelectedPropertyContext();
  if (!selected) {
    redirect("/maintenance-requests");
  }

  const [session, departments, buildings, floors, areaTypes, categories, items] =
    await Promise.all([
      auth(),
      listDepartments(),
      listBuildingsByProperty(selected.id),
      listFloorsByProperty(selected.id),
      listMaintenanceAreaTypes(),
      listMaintenanceCategories(),
      listItemsByProperty(selected.id),
    ]);

  return (
    <FormDrawer title="New Maintenance Request" backHref="/maintenance-requests">
      <MaintenanceRequestForm
        propertyId={selected.id}
        requesterName={session?.user?.name ?? session?.user?.email ?? ""}
        departments={departments}
        buildings={buildings}
        floors={floors}
        areaTypes={areaTypes}
        categories={categories}
        items={items}
        action={createMaintenanceRequestAction}
      />
    </FormDrawer>
  );
}
