"use client";

import { DataTable } from "@/components/ui/DataTable";
import { createBuildingColumns } from "@/components/location/BuildingColumns";
import type { Building } from "@/lib/types";

interface BuildingsTableProps {
  buildings: Building[];
  viewOnly: boolean;
}

export function BuildingsTable({ buildings, viewOnly }: BuildingsTableProps) {
  return (
    <DataTable
      columns={createBuildingColumns(viewOnly)}
      data={buildings}
      searchPlaceholder="e.g. filter for building name, block, etc"
      emptyMessage="No buildings yet. Create one to get started."
    />
  );
}
