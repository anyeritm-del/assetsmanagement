import { FormDrawer } from "@/components/ui/FormDrawer";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { createSupplierAction } from "@/lib/actions/suppliers";

export default function NewSupplierPage() {
  return (
    <FormDrawer title="Create Supplier" backHref="/suppliers">
      <SupplierForm action={createSupplierAction} />
    </FormDrawer>
  );
}
