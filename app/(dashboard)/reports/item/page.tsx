import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ItemReportView } from "@/components/reports/ItemReportView";
import { listArticleGroups } from "@/lib/repositories/articleGroups";
import { listArticles } from "@/lib/repositories/articles";
import { listBuildingsByProperty } from "@/lib/repositories/buildings";
import { listDepartments } from "@/lib/repositories/departments";
import { listEquipment } from "@/lib/repositories/equipment";
import { listFloorsByProperty } from "@/lib/repositories/floors";
import { listItemsByProperty } from "@/lib/repositories/items";
import { listRoomsByProperty } from "@/lib/repositories/rooms";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";

export default async function ItemReportPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to generate its item report.
      </div>
    );
  }

  const [items, buildings, floors, rooms, departments, equipment, articleGroups, articles] =
    await Promise.all([
      listItemsByProperty(selected.id),
      listBuildingsByProperty(selected.id),
      listFloorsByProperty(selected.id),
      listRoomsByProperty(selected.id),
      listDepartments(),
      listEquipment(),
      listArticleGroups(),
      listArticles(),
    ]);
  const articlesById = new Map(articles.map((article) => [article.id, article]));

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Report" }, { label: "Item" }]} />
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Report</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Item</p>
      <ItemReportView
        items={items}
        buildings={buildings}
        floors={floors}
        rooms={rooms}
        departments={departments}
        equipment={equipment}
        articleGroups={articleGroups}
        articles={articles}
        articlesById={articlesById}
      />
    </div>
  );
}
