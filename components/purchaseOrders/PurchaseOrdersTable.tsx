"use client";

import { DataTable } from "@/components/ui/DataTable";
import { createPurchaseOrderColumns } from "@/components/purchaseOrders/PurchaseOrderColumns";
import type { PurchaseOrder, Supplier } from "@/lib/types";

interface PurchaseOrdersTableProps {
  purchaseOrders: PurchaseOrder[];
  suppliersById: Map<string, Supplier>;
  viewOnly?: boolean;
}

export function PurchaseOrdersTable({
  purchaseOrders,
  suppliersById,
  viewOnly = false,
}: PurchaseOrdersTableProps) {
  const columns = createPurchaseOrderColumns(suppliersById).filter(
    (column) => !viewOnly || column.id !== "actions",
  );
  return (
    <DataTable
      columns={columns}
      data={purchaseOrders}
      searchPlaceholder="e.g. filter for supplier, purchase number, title, etc"
      emptyMessage="No purchase orders yet. Create one to get started."
    />
  );
}
