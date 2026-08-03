import { notFound } from "next/navigation";
import { FormDrawer } from "@/components/ui/FormDrawer";
import { PurchaseOrderForm } from "@/components/purchaseOrders/PurchaseOrderForm";
import { updatePurchaseOrderAction } from "@/lib/actions/purchaseOrders";
import { getPurchaseOrder } from "@/lib/repositories/purchaseOrders";
import { listSuppliers } from "@/lib/repositories/suppliers";

export default async function EditPurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const purchaseOrder = await getPurchaseOrder(id);
  if (!purchaseOrder) {
    notFound();
  }

  const suppliers = await listSuppliers();

  return (
    <FormDrawer title="Edit Purchase Order" backHref="/purchase-orders">
      <PurchaseOrderForm
        propertyId={purchaseOrder.property_id}
        suppliers={suppliers}
        purchaseOrder={purchaseOrder}
        action={updatePurchaseOrderAction.bind(null, purchaseOrder.id)}
      />
    </FormDrawer>
  );
}
