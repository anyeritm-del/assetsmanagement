import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AssignmentForm } from "@/components/maintenanceRequests/AssignmentForm";
import { MaintenanceStatusBadge } from "@/components/maintenanceRequests/MaintenanceStatusBadge";
import { MaintenanceStatusForm } from "@/components/maintenanceRequests/MaintenanceStatusForm";
import { PriorityBadge } from "@/components/maintenanceRequests/PriorityBadge";
import {
  updateMaintenanceRequestAssignmentAction,
  updateMaintenanceRequestStatusAction,
} from "@/lib/actions/maintenanceRequests";
import { canManageMaintenance } from "@/lib/maintenanceAuth";
import { getBuilding } from "@/lib/repositories/buildings";
import { getDepartment } from "@/lib/repositories/departments";
import { listEmployees } from "@/lib/repositories/employees";
import { getFloor } from "@/lib/repositories/floors";
import { getItem } from "@/lib/repositories/items";
import { getMaintenanceAreaType } from "@/lib/repositories/maintenanceAreaTypes";
import { getMaintenanceCategory } from "@/lib/repositories/maintenanceCategories";
import { getMaintenanceRequest } from "@/lib/repositories/maintenanceRequests";

export default async function MaintenanceRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getMaintenanceRequest(id);
  if (!request) {
    notFound();
  }

  const [department, building, floor, areaType, category, item, employees, allowed] =
    await Promise.all([
      request.department_id ? getDepartment(request.department_id) : null,
      getBuilding(request.building_id),
      request.floor_id ? getFloor(request.floor_id) : null,
      request.area_type_id ? getMaintenanceAreaType(request.area_type_id) : null,
      request.category_id ? getMaintenanceCategory(request.category_id) : null,
      request.item_id ? getItem(request.item_id) : null,
      listEmployees(),
      canManageMaintenance(),
    ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumb items={[{ label: "Maintenance Requests", href: "/maintenance-requests" }, { label: "Detail" }]} />

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {request.problem}
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <PriorityBadge priority={request.priority} />
              <MaintenanceStatusBadge status={request.status} />
              {request.pm_schedule_id && (
                <Link
                  href={`/preventive-maintenance/${request.pm_schedule_id}`}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400"
                >
                  Auto-generated from PM Schedule
                </Link>
              )}
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate-500 dark:text-slate-400">Department</dt>
          <dd className="text-slate-900 dark:text-slate-100">{department?.name ?? "—"}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Requester</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {request.requester_name}
            {request.requester_email ? ` (${request.requester_email})` : ""}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Building</dt>
          <dd className="text-slate-900 dark:text-slate-100">{building?.name ?? "—"}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Floor</dt>
          <dd className="text-slate-900 dark:text-slate-100">{floor?.name ?? "—"}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Location / Area</dt>
          <dd className="text-slate-900 dark:text-slate-100">{areaType?.name ?? "—"}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Room Number</dt>
          <dd className="text-slate-900 dark:text-slate-100">{request.room_number || "—"}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Category</dt>
          <dd className="text-slate-900 dark:text-slate-100">{category?.name ?? "—"}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Asset / Equipment</dt>
          <dd className="text-slate-900 dark:text-slate-100">{item?.name ?? "—"}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Assigned To</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {employees.find((employee) => employee.id === request.assigned_to_employee_id)
              ?.name ?? "Unassigned"}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Requires Shutdown?</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {request.requires_shutdown ? "Yes" : "No"}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Requires External Vendor?</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {request.requires_external_vendor ? "Yes" : "No"}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Description</dt>
          <dd className="col-span-2 text-slate-900 dark:text-slate-100">
            {request.description || "—"}
          </dd>
        </dl>

        {request.photo_view_link && (
          <div className="mt-4">
            <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">Photo</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/photo/${request.photo_drive_file_id}`}
              alt="Maintenance request"
              className="h-40 w-40 rounded-lg border border-slate-200 object-cover dark:border-slate-800"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Assignment
        </h2>
        {allowed ? (
          <AssignmentForm
            requestId={request.id}
            employees={employees}
            currentAssigneeId={request.assigned_to_employee_id}
            action={updateMaintenanceRequestAssignmentAction}
          />
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            You don&apos;t have permission to change the assignment. Ask an administrator to grant
            you &ldquo;Can Manage Maintenance&rdquo; in Users.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Update Status
        </h2>
        {allowed ? (
          <MaintenanceStatusForm
            requestId={request.id}
            currentStatus={request.status}
            action={updateMaintenanceRequestStatusAction}
          />
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            You don&apos;t have permission to update the status. Ask an administrator to grant you
            &ldquo;Can Manage Maintenance&rdquo; in Users.
          </p>
        )}
      </div>
    </div>
  );
}
