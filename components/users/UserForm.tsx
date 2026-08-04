"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { USER_LEVELS, USER_LEVEL_LABELS, USER_STATUSES } from "@/lib/constants";
import type { Property, User } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/users";

interface UserFormProps {
  user?: User;
  properties: Property[];
  action: (formData: FormData) => Promise<ActionResult>;
}

export function UserForm({ user, properties, action }: UserFormProps) {
  const router = useRouter();
  const [level, setLevel] = useState(user?.level ?? "user");
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result.success) {
        router.push("/users");
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Email
        </label>
        <input
          name="email"
          defaultValue={user?.email}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          User Name
        </label>
        <input
          name="name"
          defaultValue={user?.name}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Password
        </label>
        <input
          type="password"
          name="password"
          required={!user}
          minLength={8}
          autoComplete="new-password"
          placeholder={user ? "Leave blank to keep current password" : undefined}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          At least 8 characters. Stored hashed -- not usable for sign-in yet.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Status
          </label>
          <select
            name="status"
            defaultValue={user?.status ?? "active"}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            {USER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Level
          </label>
          <select
            name="level"
            value={level}
            onChange={(event) => setLevel(event.target.value as typeof level)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            {USER_LEVELS.map((levelOption) => (
              <option key={levelOption} value={levelOption}>
                {USER_LEVEL_LABELS[levelOption]}
              </option>
            ))}
          </select>
          {level === "view_only" && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Blocked from creating, editing, or deciding anything across every module -- can only
              browse and switch properties.
            </p>
          )}
        </div>
      </div>

      {level !== "administrator" && level !== "owner" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Assigned Property {level === "property_admin" && <span className="text-rose-500">*</span>}
          </label>
          <select
            name="assigned_property_id"
            required={level === "property_admin"}
            defaultValue={user?.assigned_property_id ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">{level === "property_admin" ? "Select a hotel" : "No restriction (all hotels)"}</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {level === "property_admin"
              ? "Property admin can only access this one hotel -- the property switcher locks to it."
              : "If set, this user's property switcher locks to only this hotel. Leave blank for access to all hotels."}
          </p>
        </div>
      )}

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="can_manage_maintenance"
          defaultChecked={user?.can_manage_maintenance ?? false}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
        />
        <span>
          <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Can Manage Maintenance
          </span>
          <span className="block text-xs text-slate-400 dark:text-slate-500">
            Lets this user resolve Maintenance Requests (status/assignment) and run PM Check.
            Administrator and Owner can always do this regardless of this checkbox.
          </span>
        </span>
      </label>

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/users")}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
