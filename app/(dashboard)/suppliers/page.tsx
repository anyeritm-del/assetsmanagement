import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { supplierColumns } from "@/components/suppliers/SupplierColumns";
import { listSuppliers } from "@/lib/repositories/suppliers";
import { isViewOnly } from "@/lib/viewOnlyGuard";

export default async function SuppliersPage() {
  const [suppliers, viewOnly] = await Promise.all([listSuppliers(), isViewOnly()]);
  const columns = viewOnly
    ? supplierColumns.filter((column) => column.id !== "actions")
    : supplierColumns;

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Suppliers" }, { label: "List" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Suppliers</h1>
        {!viewOnly && (
          <Link
            href="/suppliers/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        )}
      </div>
      <DataTable
        columns={columns}
        data={suppliers}
        searchPlaceholder="Search supplier by name"
        emptyMessage="No suppliers yet. Create one to get started."
      />
    </div>
  );
}
