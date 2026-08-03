import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { updateSupplierAction } from "@/lib/actions/suppliers";
import { getSupplier } from "@/lib/repositories/suppliers";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplier(id);
  if (!supplier) {
    notFound();
  }

  return (
    <FormDrawer title="Edit Supplier" backHref="/suppliers">
      <SupplierForm supplier={supplier} action={updateSupplierAction.bind(null, supplier.id)} />
    </FormDrawer>
  );
}
