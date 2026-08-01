"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ImageOff, Pencil } from "lucide-react";
import type { Building, Item } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function createItemColumns(buildingsById: Map<string, Building>): ColumnDef<Item>[] {
  return [
    {
      id: "photo",
      header: "",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.photo_drive_file_id ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/photo/${row.original.photo_drive_file_id}`}
            alt={row.original.name}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-300 dark:bg-slate-800">
            <ImageOff className="h-4 w-4" />
          </div>
        ),
    },
    {
      accessorKey: "name",
      header: "Item Name",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category || "—",
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => row.original.code || "—",
    },
    {
      id: "location",
      header: "Building / Floor",
      cell: ({ row }) => {
        const building = buildingsById.get(row.original.building_id);
        const floor = row.original.floor_number;
        return `${building?.name ?? "Unknown"}${floor !== null ? ` / Floor ${floor}` : ""}`;
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/items/${row.original.id}`}
          className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
          aria-label="Edit item"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      ),
    },
  ];
}
