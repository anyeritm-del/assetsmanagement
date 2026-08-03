"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ImageOff, Info, Pencil } from "lucide-react";
import type { Article, Building, Floor, Item, Room } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function createItemColumns(
  buildingsById: Map<string, Building>,
  floorsById: Map<string, Floor>,
  roomsById: Map<string, Room>,
  articlesById: Map<string, Article>,
): ColumnDef<Item>[] {
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
      id: "article",
      header: "Article",
      cell: ({ row }) => {
        const article = row.original.article_id ? articlesById.get(row.original.article_id) : null;
        return article?.name ?? "—";
      },
    },
    {
      accessorKey: "serial_number",
      header: "Serial Number",
      cell: ({ row }) => row.original.serial_number || "—",
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
      header: "Building / Floor / Room",
      cell: ({ row }) => {
        const building = buildingsById.get(row.original.building_id);
        const room = row.original.room_id ? roomsById.get(row.original.room_id) : null;
        const floor = room ? floorsById.get(room.floor_id) : null;
        const parts = [building?.name ?? "Unknown", floor?.name, room?.name].filter(Boolean);
        return parts.join(" / ");
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
        <div className="flex items-center gap-2">
          <Link
            href={`/items/${row.original.id}`}
            className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
            aria-label="Edit item"
            title="Edit item"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <Link
            href={`/items/${row.original.id}/view`}
            className="inline-flex items-center justify-center rounded-full border border-teal-200 p-2 text-teal-600 hover:bg-teal-50 dark:border-teal-900 dark:text-teal-400 dark:hover:bg-teal-500/10"
            aria-label={`View ${row.original.name}`}
            title={`View ${row.original.name}`}
          >
            <Info className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];
}
