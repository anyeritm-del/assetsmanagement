import { redirect } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { PurchaseOrderForm } from "@/components/purchaseOrders/PurchaseOrderForm";
import { createPurchaseOrderAction } from "@/lib/actions/purchaseOrders";
import { listSuppliers } from "@/lib/repositories/suppliers";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function NewPurchaseOrderPage() {
  const { selected } = await getSelectedPropertyContext();
  if (!selected) {
    redirect("/purchase-orders");
  }

  const suppliers = await listSuppliers();

  return (
    <FormDrawer title="Create Purchase Order" backHref="/purchase-orders">
      <PurchaseOrderForm
        propertyId={selected.id}
        suppliers={suppliers}
        action={createPurchaseOrderAction}
      />
    </FormDrawer>
  );
}
