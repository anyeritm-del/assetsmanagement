"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { PriorityBadge } from "@/components/maintenanceRequests/PriorityBadge";
import { MaintenanceStatusBadge } from "@/components/maintenanceRequests/MaintenanceStatusBadge";
import type {
  Building,
  Employee,
  MaintenanceAreaType,
  MaintenanceCategory,
  MaintenanceRequest,
} from "@/lib/types";

interface MaintenanceRequestsTableProps {
  requests: MaintenanceRequest[];
  buildingsById: Map<string, Building>;
  areaTypesById: Map<string, MaintenanceAreaType>;
  categoriesById: Map<string, MaintenanceCategory>;
  employeesById: Map<string, Employee>;
}

export function MaintenanceRequestsTable({
  requests,
  buildingsById,
  areaTypesById,
  categoriesById,
  employeesById,
}: MaintenanceRequestsTableProps) {
  const columns: ColumnDef<MaintenanceRequest>[] = [
    {
      accessorKey: "problem",
      header: "Problem / Issue",
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => {
        const categoryId = row.original.category_id;
        return (categoryId ? categoriesById.get(categoryId)?.name : undefined) ?? "—";
      },
    },
    {
      id: "location",
      header: "Location",
      cell: ({ row }) => {
        const building = buildingsById.get(row.original.building_id)?.name ?? "Unknown";
        const areaTypeId = row.original.area_type_id;
        const area = (areaTypeId ? areaTypesById.get(areaTypeId)?.name : undefined) ?? "";
        const room = row.original.room_number ? ` #${row.original.room_number}` : "";
        return [building, area].filter(Boolean).join(" · ") + room;
      },
    },
    {
      id: "priority",
      header: "Priority",
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: "requester_name",
      header: "Requested By",
    },
    {
      id: "assigned_to",
      header: "Assigned To",
      cell: ({ row }) => {
        const assigneeId = row.original.assigned_to_employee_id;
        return (assigneeId ? employeesById.get(assigneeId)?.name : undefined) ?? "Unassigned";
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <MaintenanceStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/maintenance-requests/${row.original.id}`}
          className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
          aria-label="View maintenance request"
          title="View / update"
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
      searchPlaceholder="e.g. filter for problem, requester, etc"
      emptyMessage="No maintenance requests yet. Create one to get started."
    />
  );
}
