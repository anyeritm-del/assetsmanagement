import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { WarrantyReportView } from "@/components/reports/WarrantyReportView";
import { listBuildingsByProperty } from "@/lib/repositories/buildings";
import { listItemsByProperty } from "@/lib/repositories/items";
import { listPurchaseOrdersByProperty } from "@/lib/repositories/purchaseOrders";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function WarrantyReportPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to generate its warranty report.
      </div>
    );
  }

  const [items, buildings, purchaseOrders] = await Promise.all([
    listItemsByProperty(selected.id),
    listBuildingsByProperty(selected.id),
    listPurchaseOrdersByProperty(selected.id),
  ]);
  const buildingsById = new Map(buildings.map((building) => [building.id, building]));
  const purchaseOrdersById = new Map(purchaseOrders.map((po) => [po.id, po]));

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Report" }, { label: "Warranty" }]} />
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Report</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Warranty</p>
      <WarrantyReportView
        items={items}
        buildingsById={buildingsById}
        purchaseOrdersById={purchaseOrdersById}
      />
    </div>
  );
}
