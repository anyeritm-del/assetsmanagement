import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { OutgoingRecordsTable } from "@/components/outgoingRecords/OutgoingRecordsTable";
import { listItemsByProperty } from "@/lib/repositories/items";
import { listAllOutgoingRecordItems } from "@/lib/repositories/outgoingRecordItems";
import { listOutgoingRecordsByProperty } from "@/lib/repositories/outgoingRecords";
import { listProperties } from "@/lib/repositories/properties";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";
import type { OutgoingRecordItem } from "@/lib/types";

export default async function OutgoingRecordsPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to view its outgoing loan requests.
      </div>
    );
  }

  const [records, items, properties, allRecordItems] = await Promise.all([
    listOutgoingRecordsByProperty(selected.id),
    listItemsByProperty(selected.id),
    listProperties(),
    listAllOutgoingRecordItems(),
  ]);
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const propertiesById = new Map(properties.map((property) => [property.id, property]));
  const recordItemsById = new Map<string, OutgoingRecordItem[]>();
  for (const line of allRecordItems) {
    const existing = recordItemsById.get(line.outgoing_record_id) ?? [];
    existing.push(line);
    recordItemsById.set(line.outgoing_record_id, existing);
  }

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: selected.name }, { label: "Outgoing" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Outgoing Loan Requests
        </h1>
        <Link
          href="/outgoing-records/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Link>
      </div>
      <OutgoingRecordsTable
        records={records}
        recordItemsById={recordItemsById}
        itemsById={itemsById}
        propertiesById={propertiesById}
      />
    </div>
  );
}
