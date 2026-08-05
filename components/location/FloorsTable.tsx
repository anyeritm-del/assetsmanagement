"use client";

import { DataTable } from "@/components/ui/DataTable";
import { createFloorColumns } from "@/components/location/FloorColumns";
import type { Floor } from "@/lib/types";

interface FloorsTableProps {
  floors: Floor[];
  viewOnly: boolean;
}

export function FloorsTable({ floors, viewOnly }: FloorsTableProps) {
  return (
    <DataTable
      columns={createFloorColumns(viewOnly)}
      data={floors}
      searchPlaceholder="e.g. filter for floor name, etc"
      emptyMessage="No floors yet. Create one to get started."
    />
  );
}
