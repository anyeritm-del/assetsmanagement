"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Pencil, QrCode } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency } from "@/lib/currency";
import { isDateStringInRange } from "@/lib/reportHelpers";
import { ITEM_STATUSES } from "@/lib/constants";
import type {
  Article,
  ArticleGroup,
  Building,
  Department,
  Equipment,
  Floor,
  Item,
  Room,
} from "@/lib/types";

interface ItemReportViewProps {
  items: Item[];
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];
  departments: Department[];
  equipment: Equipment[];
  articleGroups: ArticleGroup[];
  articles: Article[];
  articlesById: Map<string, Article>;
}

const EMPTY_FILTERS = {
  buildingId: "",
  floorId: "",
  roomId: "",
  departmentId: "",
  equipmentId: "",
  articleGroupId: "",
  articleId: "",
  createdFrom: "",
  createdTo: "",
  status: "",
};

export function ItemReportView({
  items,
  buildings,
  floors,
  rooms,
  departments,
  equipment,
  articleGroups,
  articles,
  articlesById,
}: ItemReportViewProps) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [results, setResults] = useState<Item[]>(items);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  const roomsById = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms]);
  const floorsForBuilding = filters.buildingId
    ? floors.filter((floor) => floor.building_id === filters.buildingId)
    : floors;
  const roomsForFloor = filters.floorId
    ? rooms.filter((room) => room.floor_id === filters.floorId)
    : rooms;
  const articlesForGroup = filters.articleGroupId
    ? articles.filter((article) => article.article_group_id === filters.articleGroupId)
    : articles;

  function updateFilter(key: keyof typeof EMPTY_FILTERS, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleCreateReport() {
    const filtered = items.filter((item) => {
      if (filters.buildingId && item.building_id !== filters.buildingId) return false;
      if (filters.roomId && item.room_id !== filters.roomId) return false;
      if (filters.floorId && !filters.roomId) {
        const room = item.room_id ? roomsById.get(item.room_id) : null;
        if (!room || room.floor_id !== filters.floorId) return false;
      }
      if (filters.departmentId && item.department_id !== filters.departmentId) return false;
      if (filters.equipmentId && item.equipment_id !== filters.equipmentId) return false;
      if (filters.articleId && item.article_id !== filters.articleId) return false;
      if (!filters.articleId && filters.articleGroupId) {
        const article = item.article_id ? articlesById.get(item.article_id) : null;
        if (!article || article.article_group_id !== filters.articleGroupId) return false;
      }
      if (filters.status && item.status !== filters.status) return false;
      if (!isDateStringInRange(item.created_at, filters.createdFrom || null, filters.createdTo || null)) {
        return false;
      }
      return true;
    });
    setResults(filtered);
  }

  function handleReset() {
    setFilters(EMPTY_FILTERS);
    setResults(items);
  }

  function handlePrintQrCode() {
    const ids = selectedItems.map((item) => item.id).join(",");
    window.open(`/items/print-labels?ids=${ids}`, "_blank");
  }

  function handleDownloadCsv() {
    downloadCsv(
      "item-report.csv",
      results.map((item) => ({
        Created: item.created_at.slice(0, 10),
        Name: item.name,
        Code: item.code,
        "Serial Number": item.serial_number,
        Article: item.article_id ? articlesById.get(item.article_id)?.name ?? "" : "",
        Status: item.status,
        "Is Assigned": item.assigned_employee_id ? "Yes" : "No",
        "Acquisition Value": item.acquisition_value,
        "Book Value": item.book_value,
      })),
    );
  }

  const totalAcquisitionValue = results.reduce((sum, item) => sum + item.acquisition_value, 0);
  const totalBookValue = results.reduce((sum, item) => sum + item.book_value, 0);

  const columns: ColumnDef<Item>[] = [
    {
      id: "created",
      header: "Created",
      cell: ({ row }) => row.original.created_at.slice(0, 10),
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      id: "article",
      header: "Article",
      cell: ({ row }) =>
        (row.original.article_id ? articlesById.get(row.original.article_id)?.name : null) ?? "—",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "is_assigned",
      header: "Is Assigned",
      cell: ({ row }) => (row.original.assigned_employee_id ? "Yes" : "No"),
    },
    {
      id: "acquisition_value",
      header: "Acquisition Value",
      cell: ({ row }) => formatCurrency(row.original.acquisition_value),
    },
    {
      id: "book_value",
      header: "Book Value",
      cell: ({ row }) => formatCurrency(row.original.book_value),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/items/${row.original.id}`}
          className="inline-flex items-center justify-center rounded-full border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
          aria-label="View item"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  const selectClass =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Generate Report
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <select
            value={filters.buildingId}
            onChange={(event) => {
              updateFilter("buildingId", event.target.value);
              updateFilter("floorId", "");
              updateFilter("roomId", "");
            }}
            className={selectClass}
          >
            <option value="">Select building</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
          <select
            value={filters.floorId}
            onChange={(event) => {
              updateFilter("floorId", event.target.value);
              updateFilter("roomId", "");
            }}
            className={selectClass}
          >
            <option value="">Select floor</option>
            {floorsForBuilding.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.name}
              </option>
            ))}
          </select>
          <select
            value={filters.roomId}
            onChange={(event) => updateFilter("roomId", event.target.value)}
            className={selectClass}
          >
            <option value="">Select location</option>
            {roomsForFloor.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>

          <select
            value={filters.departmentId}
            onChange={(event) => updateFilter("departmentId", event.target.value)}
            className={selectClass}
          >
            <option value="">Select department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          <select
            value={filters.equipmentId}
            onChange={(event) => updateFilter("equipmentId", event.target.value)}
            className={selectClass}
          >
            <option value="">Select equipment</option>
            {equipment.map((equipmentItem) => (
              <option key={equipmentItem.id} value={equipmentItem.id}>
                {equipmentItem.name}
              </option>
            ))}
          </select>
          <div />

          <select
            value={filters.articleGroupId}
            onChange={(event) => {
              updateFilter("articleGroupId", event.target.value);
              updateFilter("articleId", "");
            }}
            className={selectClass}
          >
            <option value="">Select article group</option>
            {articleGroups.map((articleGroup) => (
              <option key={articleGroup.id} value={articleGroup.id}>
                {articleGroup.name}
              </option>
            ))}
          </select>
          <select
            value={filters.articleId}
            onChange={(event) => updateFilter("articleId", event.target.value)}
            className={selectClass}
          >
            <option value="">Select article</option>
            {articlesForGroup.map((article) => (
              <option key={article.id} value={article.id}>
                {article.name}
              </option>
            ))}
          </select>
          <div />

          <input
            type="date"
            value={filters.createdFrom}
            onChange={(event) => updateFilter("createdFrom", event.target.value)}
            placeholder="Created date from"
            className={selectClass}
          />
          <input
            type="date"
            value={filters.createdTo}
            onChange={(event) => updateFilter("createdTo", event.target.value)}
            placeholder="Created date to"
            className={selectClass}
          />
          <select
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value)}
            className={selectClass}
          >
            <option value="">All</option>
            {ITEM_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleCreateReport}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create Report
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Total Acquisition Value:{" "}
          <span className="font-semibold">{formatCurrency(totalAcquisitionValue)}</span>
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Total Book Value: <span className="font-semibold">{formatCurrency(totalBookValue)}</span>
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handlePrintQrCode}
          disabled={selectedItems.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <QrCode className="h-4 w-4" />
          Print QR Code{selectedItems.length > 0 ? ` (${selectedItems.length})` : ""}
        </button>
        <button
          type="button"
          onClick={handleDownloadCsv}
          disabled={results.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download csv
        </button>
      </div>

      <DataTable
        columns={columns}
        data={results}
        searchPlaceholder="e.g. filter for item name, article, etc"
        emptyMessage="No items match this report."
        enableRowSelection
        onSelectedRowsChange={setSelectedItems}
      />
    </div>
  );
}
