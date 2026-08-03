import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DepreciationReportView } from "@/components/reports/DepreciationReportView";
import { listBuildingsByProperty } from "@/lib/repositories/buildings";
import { listItemsByProperty } from "@/lib/repositories/items";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function DepreciationReportPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to generate its depreciation report.
      </div>
    );
  }

  const [items, buildings] = await Promise.all([
    listItemsByProperty(selected.id),
    listBuildingsByProperty(selected.id),
  ]);
  const buildingsById = new Map(buildings.map((building) => [building.id, building]));

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Report" }, { label: "Depreciation" }]} />
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Report</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Depreciation</p>
      <DepreciationReportView items={items} buildingsById={buildingsById} />
    </div>
  );
}
