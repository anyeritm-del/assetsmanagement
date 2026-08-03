"use client";

import { useEffect, useState } from "react";
import {
  type ColumnDef,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  /**
   * Fired when Enter is pressed in the search box. Receives the raw search text and the rows
   * currently matching the filter. Lets a caller wire "scan a barcode/QR to jump straight to a
   * record" without DataTable itself knowing about routes.
   */
  onEnterInSearch?: (value: string, filteredRows: TData[]) => void;
  /** Adds a checkbox column and reports the selected rows whenever the selection changes. */
  enableRowSelection?: boolean;
  onSelectedRowsChange?: (rows: TData[]) => void;
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = "Search...",
  emptyMessage = "No records found.",
  onEnterInSearch,
  enableRowSelection = false,
  onSelectedRowsChange,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectColumn: ColumnDef<TData> = {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        ref={(el) => {
          if (el) el.indeterminate = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected();
        }}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        aria-label="Select all rows on this page"
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        aria-label="Select row"
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
      />
    ),
    enableSorting: false,
  };

  const effectiveColumns = enableRowSelection ? [selectColumn, ...columns] : columns;

  const table = useReactTable({
    data,
    columns: effectiveColumns,
    state: { globalFilter, sorting, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  useEffect(() => {
    if (enableRowSelection) {
      onSelectedRowsChange?.(table.getSelectedRowModel().rows.map((row) => row.original));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && onEnterInSearch) {
                onEnterInSearch(
                  globalFilter,
                  table.getFilteredRowModel().rows.map((row) => row.original),
                );
              }
            }}
            placeholder={searchPlaceholder}
            autoFocus
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-blue-900"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-y border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-4 py-3 font-semibold select-none"
                    onClick={
                      header.column.id === "select"
                        ? undefined
                        : header.column.getToggleSortingHandler()
                    }
                    style={{
                      cursor:
                        header.column.id !== "select" && header.column.getCanSort()
                          ? "pointer"
                          : undefined,
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: "↑", desc: "↓" }[header.column.getIsSorted() as string] ?? null}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={effectiveColumns.length} className="px-4 py-10 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 p-4 text-sm text-slate-500 dark:text-slate-400">
        <span>
          {filteredCount === 0
            ? "0 of 0"
            : `${pageIndex * pageSize + 1}-${Math.min((pageIndex + 1) * pageSize, filteredCount)} of ${filteredCount}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-full border border-slate-200 p-1.5 disabled:opacity-30 dark:border-slate-700"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-full border border-slate-200 p-1.5 disabled:opacity-30 dark:border-slate-700"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
