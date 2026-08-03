import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { updatePropertyAction } from "@/lib/actions/properties";
import { getProperty } from "@/lib/repositories/properties";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) {
    notFound();
  }

  return (
    <FormDrawer title="Edit Property" backHref="/properties">
      <PropertyForm property={property} action={updatePropertyAction.bind(null, property.id)} />
    </FormDrawer>
  );
}
