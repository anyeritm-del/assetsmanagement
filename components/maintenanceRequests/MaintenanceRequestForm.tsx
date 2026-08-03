"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { PhotoUploadField } from "@/components/ui/PhotoUploadField";
import { MAINTENANCE_PRIORITIES, MAINTENANCE_PRIORITY_LABELS } from "@/lib/constants";
import type {
  Building,
  Department,
  Floor,
  Item,
  MaintenanceAreaType,
  MaintenanceCategory,
} from "@/lib/types";
import type { ActionResult } from "@/lib/actions/maintenanceRequests";

interface MaintenanceRequestFormProps {
  propertyId: string;
  requesterName: string;
  departments: Department[];
  buildings: Building[];
  floors: Floor[];
  areaTypes: MaintenanceAreaType[];
  categories: MaintenanceCategory[];
  items: Item[];
  action: (formData: FormData) => Promise<ActionResult>;
}

function ToggleField({
  name,
  label,
  helpText,
}: {
  name: string;
  label: string;
  helpText: string;
}) {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
        className="sr-only"
      />
      <span
        className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      <span>
        <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
        <span className="block text-xs text-slate-400">{helpText}</span>
      </span>
    </label>
  );
}

export function MaintenanceRequestForm({
  propertyId,
  requesterName,
  departments,
  buildings,
  floors,
  areaTypes,
  categories,
  items,
  action,
}: MaintenanceRequestFormProps) {
  const router = useRouter();
  const [buildingId, setBuildingId] = useState("");
  const floorsForBuilding = floors.filter((floor) => floor.building_id === buildingId);
  const itemOptions = items.map((item) => ({ id: item.id, label: item.name }));

  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result.success) {
        router.push("/maintenance-requests");
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="property_id" value={propertyId} />

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Requester Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              name="department_id"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="" disabled>
                Select Department
              </option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Requester
            </label>
            <input
              name="requester_name"
              defaultValue={requesterName}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Location</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Building <span className="text-rose-500">*</span>
            </label>
            <select
              name="building_id"
              required
              value={buildingId}
              onChange={(event) => setBuildingId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="" disabled>
                Select Building
              </option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Floor
            </label>
            <select
              name="floor_id"
              defaultValue=""
              disabled={!buildingId}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-900"
            >
              <option value="">Select Floor</option>
              {floorsForBuilding.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Location / Area <span className="text-rose-500">*</span>
            </label>
            <select
              name="area_type_id"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="" disabled>
                Select Location
              </option>
              {areaTypes.map((areaType) => (
                <option key={areaType.id} value={areaType.id}>
                  {areaType.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Room Number
          </label>
          <input
            name="room_number"
            placeholder="e.g. 401"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Request Details
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="category_id"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Priority <span className="text-rose-500">*</span>
            </label>
            <select
              name="priority"
              required
              defaultValue="medium"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
            >
              {MAINTENANCE_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {MAINTENANCE_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Asset / Equipment
            </label>
            <div className="mt-1">
              <SearchableSelect
                name="item_id"
                options={itemOptions}
                placeholder="Search asset (optional)"
                emptyLabel="No asset selected"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Problem / Issue <span className="text-rose-500">*</span>
          </label>
          <input
            name="problem"
            required
            placeholder="Brief description of the problem"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Detailed Description
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Additional details, symptoms, when it started..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ToggleField
            name="requires_shutdown"
            label="Requires Shutdown / Power Off?"
            helpText="Area or system needs to be taken offline"
          />
          <ToggleField
            name="requires_external_vendor"
            label="Requires External Vendor?"
            helpText="Specialist or supplier needed"
          />
        </div>
      </section>

      <PhotoUploadField />

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/maintenance-requests")}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
