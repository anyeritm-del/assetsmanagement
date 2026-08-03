"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { OutgoingStatusBadge } from "@/components/outgoingRecords/OutgoingStatusBadge";
import { getOutgoingRecordOverallStatus } from "@/lib/outgoingRecordStatus";
import type { Item, OutgoingRecord, OutgoingRecordItem, Property } from "@/lib/types";

interface ApprovalsTableProps {
  records: OutgoingRecord[];
  recordItemsById: Map<string, OutgoingRecordItem[]>;
  itemsById: Map<string, Item>;
  propertiesById: Map<string, Property>;
}

export function ApprovalsTable({
  records,
  recordItemsById,
  itemsById,
  propertiesById,
}: ApprovalsTableProps) {
  const columns: ColumnDef<OutgoingRecord>[] = [
    {
      id: "source",
      header: "From",
      cell: ({ row }) => propertiesById.get(row.original.source_property_id)?.name ?? "Unknown",
    },
    {
      id: "destination",
      header: "To",
      cell: ({ row }) =>
        propertiesById.get(row.original.destination_property_id)?.name ?? "Unknown",
    },
    {
      id: "items",
      header: "Item(s)",
      cell: ({ row }) => {
        const lines = recordItemsById.get(row.original.id) ?? [];
        if (lines.length === 0) return "—";
        const first = itemsById.get(lines[0].item_id)?.name ?? "Unknown";
        return lines.length === 1 ? first : `${first} +${lines.length - 1} more`;
      },
    },
    {
      accessorKey: "requested_by_name",
      header: "Requested By",
    },
    {
      id: "status",
      header: "Awaiting",
      cell: ({ row }) => (
        <OutgoingStatusBadge status={getOutgoingRecordOverallStatus(row.original)} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/outgoing-records/${row.original.id}`}
          className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
          aria-label="Review outgoing record"
          title="Review / decide"
        >
          <Eye className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={records}
      searchPlaceholder="e.g. filter for hotel, requester, etc"
      emptyMessage="Nothing awaiting approval right now."
    />
  );
}
