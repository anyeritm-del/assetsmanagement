"use client";

import { DataTable } from "@/components/ui/DataTable";
import { createItemAssignmentColumns } from "@/components/items/ItemAssignmentColumns";
import type { Employee, Item } from "@/lib/types";

interface ItemAssignmentsTableProps {
  items: Item[];
  employeesById: Map<string, Employee>;
}

export function ItemAssignmentsTable({ items, employeesById }: ItemAssignmentsTableProps) {
  return (
    <DataTable
      columns={createItemAssignmentColumns(employeesById)}
      data={items}
      searchPlaceholder="e.g. filter for item name, employee name, etc"
      emptyMessage="No items found for this property."
    />
  );
}
