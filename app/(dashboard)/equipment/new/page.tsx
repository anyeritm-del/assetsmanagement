import { FormDrawer } from "@/components/ui/FormDrawer";
import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import { createEquipmentAction } from "@/lib/actions/equipment";

export default function NewEquipmentPage() {
  return (
    <FormDrawer title="Create Equipment" backHref="/equipment">
      <EquipmentForm action={createEquipmentAction} />
    </FormDrawer>
  );
}
