import { FormDrawer } from "@/components/ui/FormDrawer";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { createPropertyAction } from "@/lib/actions/properties";

export default function NewPropertyPage() {
  return (
    <FormDrawer title="Create Property" backHref="/properties">
      <PropertyForm action={createPropertyAction} />
    </FormDrawer>
  );
}
