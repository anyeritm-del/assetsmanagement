import { listBuildingsByProperty } from "@/lib/repositories/buildings";
import { listItemsByProperty } from "@/lib/repositories/items";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function DashboardPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        No properties found. Add a row to the <strong>Properties</strong> sheet to get started.
      </div>
    );
  }

  const [buildings, items] = await Promise.all([
    listBuildingsByProperty(selected.id),
    listItemsByProperty(selected.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {selected.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Overview of buildings and items for this property.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Buildings</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {buildings.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Items</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {items.length}
          </p>
        </div>
      </div>
    </div>
  );
}
