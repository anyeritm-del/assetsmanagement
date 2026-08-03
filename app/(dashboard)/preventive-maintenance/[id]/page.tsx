import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { PMScheduleForm } from "@/components/pmSchedules/PMScheduleForm";
import { updatePMScheduleAction } from "@/lib/actions/pmSchedules";
import { listEmployees } from "@/lib/repositories/employees";
import { listItemsByProperty } from "@/lib/repositories/items";
import { getPMSchedule } from "@/lib/repositories/pmSchedules";

export default async function EditPMSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const schedule = await getPMSchedule(id);
  if (!schedule) {
    notFound();
  }

  const [items, employees] = await Promise.all([
    listItemsByProperty(schedule.property_id),
    listEmployees(),
  ]);

  return (
    <FormDrawer title="Edit PM Schedule" backHref="/preventive-maintenance">
      <PMScheduleForm
        propertyId={schedule.property_id}
        schedule={schedule}
        items={items}
        employees={employees}
        action={updatePMScheduleAction.bind(null, schedule.id)}
      />
    </FormDrawer>
  );
}
