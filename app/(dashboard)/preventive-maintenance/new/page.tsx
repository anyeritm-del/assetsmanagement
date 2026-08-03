import { redirect } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { PMScheduleForm } from "@/components/pmSchedules/PMScheduleForm";
import { createPMScheduleAction } from "@/lib/actions/pmSchedules";
import { listEmployees } from "@/lib/repositories/employees";
import { listItemsByProperty } from "@/lib/repositories/items";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function NewPMSchedulePage() {
  const { selected } = await getSelectedPropertyContext();
  if (!selected) {
    redirect("/preventive-maintenance");
  }

  const [items, employees] = await Promise.all([
    listItemsByProperty(selected.id),
    listEmployees(),
  ]);

  return (
    <FormDrawer title="Add PM Schedule" backHref="/preventive-maintenance">
      <PMScheduleForm
        propertyId={selected.id}
        items={items}
        employees={employees}
        action={createPMScheduleAction}
      />
    </FormDrawer>
  );
}
