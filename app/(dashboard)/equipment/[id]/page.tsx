import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import { updateEquipmentAction } from "@/lib/actions/equipment";
import { getEquipment } from "@/lib/repositories/equipment";

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const equipment = await getEquipment(id);
  if (!equipment) {
    notFound();
  }

  return (
    <FormDrawer title="Edit Equipment" backHref="/equipment">
      <EquipmentForm equipment={equipment} action={updateEquipmentAction.bind(null, equipment.id)} />
    </FormDrawer>
  );
}
