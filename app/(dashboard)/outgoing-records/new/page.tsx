import { redirect } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { OutgoingRecordForm } from "@/components/outgoingRecords/OutgoingRecordForm";
import { createOutgoingRecordAction } from "@/lib/actions/outgoingRecords";
import { listItemsByProperty } from "@/lib/repositories/items";
import { listProperties } from "@/lib/repositories/properties";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function NewOutgoingRecordPage() {
  const { selected } = await getSelectedPropertyContext();
  if (!selected) {
    redirect("/outgoing-records");
  }

  const [items, properties] = await Promise.all([
    listItemsByProperty(selected.id),
    listProperties(),
  ]);
  const destinationProperties = properties.filter((property) => property.id !== selected.id);

  return (
    <FormDrawer title="Create Outgoing Loan Request" backHref="/outgoing-records">
      <OutgoingRecordForm
        sourcePropertyId={selected.id}
        destinationProperties={destinationProperties}
        items={items}
        action={createOutgoingRecordAction}
      />
    </FormDrawer>
  );
}
