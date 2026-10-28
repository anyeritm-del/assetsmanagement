import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { userColumns, type UserRow } from "@/components/users/UserColumns";
import { listProperties } from "@/lib/repositories/properties";
import { listUsers } from "@/lib/repositories/users";
import { isViewOnly } from "@/lib/viewOnlyGuard";
import type { User } from "@/lib/types";

export default async function UsersPage() {
  const [users, properties, viewOnly] = await Promise.all([
    listUsers(),
    listProperties(),
    isViewOnly(),
  ]);
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  // Administrator/Owner are never locked to a hotel (see lib/selectedProperty.ts), even if an
  // assignment was saved for them. A property admin without a hotel is a misconfiguration (the
  // form requires one), so it's shown as "Not assigned" rather than hidden. password_hash is dropped so it never reaches the browser.
  const rows: UserRow[] = users.map((user) => {
    const row: Partial<User> = { ...user };
    delete row.password_hash;
    const exempt = user.level === "administrator" || user.level === "owner";
    const assignedName = user.assigned_property_id
      ? (propertyNames.get(user.assigned_property_id) ?? "Unknown property")
      : null;
    return {
      ...(row as Omit<User, "password_hash">),
      assigned_property_name: exempt
        ? "All hotels"
        : (assignedName ?? (user.level === "property_admin" ? "Not assigned" : "All hotels")),
    };
  });
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
        data={rows}
        searchPlaceholder="e.g. filter for email, name, etc"
        emptyMessage="No users yet. Create one to get started."
      />
    </div>
  );
}
