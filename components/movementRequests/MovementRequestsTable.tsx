"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { DisposalStatusBadge } from "@/components/disposalRequests/DisposalStatusBadge";
import type { Item, MovementRequest, MovementRequestItem, Property, User } from "@/lib/types";

interface MovementRequestsTableProps {
  requests: MovementRequest[];
  requestItemsById: Map<string, MovementRequestItem[]>;
  itemsById: Map<string, Item>;
  usersById: Map<string, User>;
  /** When provided, a "Hotel" column is shown -- used on the cross-property /approvals inbox. */
  propertiesById?: Map<string, Property>;
}

export function MovementRequestsTable({
  requests,
  requestItemsById,
  itemsById,
  usersById,
  propertiesById,
}: MovementRequestsTableProps) {
  const hotelColumn: ColumnDef<MovementRequest> = {
    id: "hotel",
    header: "Hotel",
    cell: ({ row }) => propertiesById?.get(row.original.property_id)?.name ?? "Unknown",
  };

  const columns: ColumnDef<MovementRequest>[] = [
    ...(propertiesById ? [hotelColumn] : []),
    {
      id: "items",
      header: "Item Name",
      cell: ({ row }) => {
        const lines = requestItemsById.get(row.original.id) ?? [];
        if (lines.length === 0) return "—";
        const first = itemsById.get(lines[0].item_id)?.name ?? "Unknown";
        return lines.length === 1 ? first : `${first} +${lines.length - 1} more`;
      },
    },
    {
      accessorKey: "requester_name",
      header: "Requester",
    },
    {
      id: "approver",
      header: "Approver",
      cell: ({ row }) => usersById.get(row.original.approver_user_id)?.name ?? "Unknown",
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => row.original.note || "—",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <DisposalStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/movement-requests/${row.original.id}`}
          className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
          aria-label="View movement request"
          title="View / decide"
        >
          <Eye className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={requests}
      searchPlaceholder="e.g. filter for item name, requester, approver, etc"
      emptyMessage="No movement requests yet."
    />
  );
}
