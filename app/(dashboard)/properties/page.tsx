import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { propertyColumns } from "@/components/properties/PropertyColumns";
import { listProperties } from "@/lib/repositories/properties";
import { isViewOnly } from "@/lib/viewOnlyGuard";

export default async function PropertiesPage() {
  const [properties, viewOnly] = await Promise.all([listProperties(), isViewOnly()]);
  const columns = viewOnly
    ? propertyColumns.filter((column) => column.id !== "actions")
    : propertyColumns;

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Properties" }, { label: "List" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Hotel Properties
        </h1>
        {!viewOnly && (
          <Link
            href="/properties/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        )}
      </div>
      <DataTable
        columns={columns}
        data={properties}
        searchPlaceholder="e.g. filter for hotel name, code, etc"
        emptyMessage="No properties yet. Create one to get started."
      />
    </div>
  );
}
