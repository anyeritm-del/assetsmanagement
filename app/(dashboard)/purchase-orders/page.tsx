import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PurchaseOrdersTable } from "@/components/purchaseOrders/PurchaseOrdersTable";
import { listPurchaseOrdersByProperty } from "@/lib/repositories/purchaseOrders";
import { listSuppliers } from "@/lib/repositories/suppliers";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function PurchaseOrdersPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to view its purchase orders.
      </div>
    );
  }

  const [purchaseOrders, suppliers] = await Promise.all([
    listPurchaseOrdersByProperty(selected.id),
    listSuppliers(),
  ]);
  const suppliersById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Purchase orders" }, { label: "List" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Purchase Orders
        </h1>
        <Link
          href="/purchase-orders/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Link>
      </div>
      <PurchaseOrdersTable purchaseOrders={purchaseOrders} suppliersById={suppliersById} />
    </div>
  );
}
