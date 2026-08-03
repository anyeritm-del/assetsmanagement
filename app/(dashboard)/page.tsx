import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { DashboardItemsTable } from "@/components/dashboard/DashboardItemsTable";
import { formatCurrency } from "@/lib/currency";
import { listArticles } from "@/lib/repositories/articles";
import { listItemsByProperty } from "@/lib/repositories/items";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";
import type { Item } from "@/lib/types";

interface DisposalRequestRow {
  date: string;
  itemName: string;
  requester: string;
  approver: string;
  status: string;
}

const disposalColumns: ColumnDef<DisposalRequestRow>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "itemName", header: "Item Name" },
  { accessorKey: "requester", header: "Requester" },
  { accessorKey: "approver", header: "Approver" },
  { accessorKey: "status", header: "Status" },
];

function summarize(items: Item[]) {
  return {
    count: items.length,
    bookValue: items.reduce((sum, item) => sum + item.book_value, 0),
    acquisitionValue: items.reduce((sum, item) => sum + item.acquisition_value, 0),
  };
}

export default async function DashboardPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        No properties found. Add a row to the <strong>Properties</strong> sheet to get started.
      </div>
    );
  }

  const [items, articles] = await Promise.all([
    listItemsByProperty(selected.id),
    listArticles(),
  ]);
  const articlesById = new Map(articles.map((article) => [article.id, article]));

  // "In use" / "Not in use" map onto our existing Item status: active vs. maintenance+disposed.
  const inUseItems = items.filter((item) => item.status === "active");
  const notInUseItems = items.filter((item) => item.status !== "active");
  const notInUse = summarize(notInUseItems);
  const inUse = summarize(inUseItems);
  const total = summarize(items);

  const latestUpdates = [...items]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5);

  const now = new Date();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthAfterStart = new Date(now.getFullYear(), now.getMonth() + 2, 1);
  const upcomingDepreciation = items.filter((item) => {
    if (!item.end_of_lifetime_date) return false;
    const date = new Date(item.end_of_lifetime_date);
    return date >= nextMonthStart && date < monthAfterStart;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {selected.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-indigo-900 p-6 text-white">
          <p className="text-sm text-indigo-200">Asset Not in use</p>
          <p className="mt-2 text-xs text-indigo-200">Item: {notInUse.count}</p>
          <p className="text-xs text-indigo-200">
            Book Value: {formatCurrency(notInUse.bookValue)}
          </p>
          <p className="text-xs text-indigo-200">
            Acquisition Value: {formatCurrency(notInUse.acquisitionValue)}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-800 p-6 text-white">
          <p className="text-sm text-emerald-200">Asset In use</p>
          <p className="mt-2 text-xs text-emerald-200">Item: {inUse.count}</p>
          <p className="text-xs text-emerald-200">Book Value: {formatCurrency(inUse.bookValue)}</p>
          <p className="text-xs text-emerald-200">
            Acquisition Value: {formatCurrency(inUse.acquisitionValue)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-900 p-6 text-white">
          <p className="text-sm text-slate-300">Total Asset</p>
          <p className="mt-2 text-xs text-slate-300">Item: {total.count}</p>
          <p className="text-xs text-slate-300">Book Value: {formatCurrency(total.bookValue)}</p>
          <p className="text-xs text-slate-300">
            Acquisition Value: {formatCurrency(total.acquisitionValue)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Latest Updates
          </h2>
          <Link
            href="/items"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            View All
          </Link>
        </div>
        <DashboardItemsTable
          items={latestUpdates}
          articlesById={articlesById}
          emptyMessage="No recent updates."
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Upcoming Item Depreciation (Next Month)
        </h2>
        <DashboardItemsTable
          items={upcomingDepreciation}
          articlesById={articlesById}
          emptyMessage="No items reaching end of lifetime next month."
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Outstanding Disposal Request(s)
        </h2>
        <DataTable<DisposalRequestRow>
          columns={disposalColumns}
          data={[]}
          searchPlaceholder="e.g. filter for item name, etc"
          emptyMessage="No data available."
        />
      </div>
    </div>
  );
}
