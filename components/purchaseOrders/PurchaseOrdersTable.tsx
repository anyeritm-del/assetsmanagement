"use client";

import { DataTable } from "@/components/ui/DataTable";
import { createPurchaseOrderColumns } from "@/components/purchaseOrders/PurchaseOrderColumns";
import type { PurchaseOrder, Supplier } from "@/lib/types";

interface PurchaseOrdersTableProps {
  purchaseOrders: PurchaseOrder[];
  suppliersById: Map<string, Supplier>;
}

export function PurchaseOrdersTable({ purchaseOrders, suppliersById }: PurchaseOrdersTableProps) {
  return (
    <DataTable
      columns={createPurchaseOrderColumns(suppliersById)}
      data={purchaseOrders}
      searchPlaceholder="e.g. filter for supplier, purchase number, title, etc"
      emptyMessage="No purchase orders yet. Create one to get started."
    />
  );
}
