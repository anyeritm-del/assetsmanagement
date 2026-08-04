import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { userColumns } from "@/components/users/UserColumns";
import { listUsers } from "@/lib/repositories/users";
import { isViewOnly } from "@/lib/viewOnlyGuard";

export default async function UsersPage() {
  const [users, viewOnly] = await Promise.all([listUsers(), isViewOnly()]);
  const columns = viewOnly
    ? userColumns.filter((column) => column.id !== "actions")
    : userColumns;

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Users" }, { label: "List" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Users</h1>
        {!viewOnly && (
          <Link
            href="/users/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        )}
      </div>
      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="e.g. filter for email, name, etc"
        emptyMessage="No users yet. Create one to get started."
      />
    </div>
  );
}
