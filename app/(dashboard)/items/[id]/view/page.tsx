import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2, UserPlus, Move as MoveIcon } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DepreciationChart } from "@/components/items/DepreciationChart";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ITEM_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/currency";
import { buildDepreciationInfo } from "@/lib/depreciation";
import { buildItemLabelData } from "@/lib/itemLabel";
import { getWarrantyExpiryDate } from "@/lib/reportHelpers";
import { getArticle } from "@/lib/repositories/articles";
import { getArticleGroup } from "@/lib/repositories/articleGroups";
import { getBuilding } from "@/lib/repositories/buildings";
import { getDepartment } from "@/lib/repositories/departments";
import { getEmployee } from "@/lib/repositories/employees";
import { getEquipment } from "@/lib/repositories/equipment";
import { getFloor } from "@/lib/repositories/floors";
import { getItem } from "@/lib/repositories/items";
import { getProperty } from "@/lib/repositories/properties";
import { getPurchaseOrder } from "@/lib/repositories/purchaseOrders";
import { getRoom } from "@/lib/repositories/rooms";
import { getSupplier } from "@/lib/repositories/suppliers";
import type { PurchaseOrder } from "@/lib/types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function ViewItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) {
    notFound();
  }

  const [property, building, room, department, equipment, article, employee, purchaseOrder, labelData] =
    await Promise.all([
      getProperty(item.property_id),
      getBuilding(item.building_id),
      item.room_id ? getRoom(item.room_id) : null,
      item.department_id ? getDepartment(item.department_id) : null,
      item.equipment_id ? getEquipment(item.equipment_id) : null,
      item.article_id ? getArticle(item.article_id) : null,
      item.assigned_employee_id ? getEmployee(item.assigned_employee_id) : null,
      item.purchase_order_id ? getPurchaseOrder(item.purchase_order_id) : null,
      buildItemLabelData(item.id),
    ]);

  const [floor, articleGroup, supplier] = await Promise.all([
    room ? getFloor(room.floor_id) : null,
    article ? getArticleGroup(article.article_group_id) : null,
    purchaseOrder?.supplier_id ? getSupplier(purchaseOrder.supplier_id) : null,
  ]);

  const purchaseOrdersById = new Map<string, PurchaseOrder>(
    purchaseOrder ? [[purchaseOrder.id, purchaseOrder]] : [],
  );
  const warrantyExpiry =
    item.warranty_months !== null ? getWarrantyExpiryDate(item, purchaseOrdersById) : null;

  const depreciationStartDate = purchaseOrder?.received_date || item.created_at;
  const depreciationInfo = item.end_of_lifetime_date
    ? buildDepreciationInfo(depreciationStartDate, item.end_of_lifetime_date, item.acquisition_value)
    : null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: property?.name ?? "Property", href: "/items" },
          ...(building ? [{ label: building.name }] : []),
          ...(floor ? [{ label: floor.name }] : []),
          ...(room ? [{ label: room.name }] : []),
          { label: item.name },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{item.name}</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/items/${item.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <Link
            href={`/items/${item.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <UserPlus className="h-4 w-4" />
            Assign to User
          </Link>
          <Link
            href={`/movement-requests/new?itemId=${item.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <MoveIcon className="h-4 w-4" />
            Move
          </Link>
          <Link
            href={`/disposal-requests/new?itemId=${item.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            <Trash2 className="h-4 w-4" />
            Dispose
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Code: <span className="font-medium text-slate-700 dark:text-slate-200">{item.code || "—"}</span>
              </p>
              <StatusBadge status={item.status} />
            </div>

            <div className="rounded-lg bg-slate-800 p-4 text-white dark:bg-slate-950">
              <p className="text-sm text-slate-300">Book Value</p>
              <p className="text-2xl font-bold">{formatCurrency(item.book_value)}</p>
              <p className="mt-1 text-xs text-slate-400">
                Acquisition Value: {formatCurrency(item.acquisition_value)}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Attributes
                </h2>
                <dl className="space-y-1.5 text-sm">
                  <div className="text-slate-600 dark:text-slate-300">
                    {[building?.name, floor?.name, room?.name].filter(Boolean).join(" / ") || "—"}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    {department?.name ?? "No department"}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    {equipment?.name ?? "No equipment category"}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    {[articleGroup?.name, article?.name].filter(Boolean).join(" / ") || "No article"}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    {supplier?.name ?? "No supplier"}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    {purchaseOrder?.purchase_number || "No purchase order"}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    {employee ? `Assigned to ${employee.name}` : "Unassigned"}
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Details
                </h2>
                <dl className="space-y-1.5 text-sm">
                  <div className="text-slate-600 dark:text-slate-300">
                    Type: {ITEM_TYPE_LABELS[item.item_type]}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    Serial Number: {item.serial_number || "—"}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">Brand: {item.brand || "—"}</div>
                  <div className="text-slate-600 dark:text-slate-300">
                    Received Date: {purchaseOrder ? formatDate(purchaseOrder.received_date) : "—"}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    Warranty:{" "}
                    {item.warranty_months !== null
                      ? `${item.warranty_months} months${
                          warrantyExpiry
                            ? ` (exp. ${formatDate(warrantyExpiry.toISOString())})`
                            : ""
                        }`
                      : "—"}
                  </div>
                  {item.notes && (
                    <div className="text-slate-600 dark:text-slate-300">{item.notes}</div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {depreciationInfo && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Depreciation
              </h2>
              <div className="mb-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {item.lifetime_years && <p>Lifetime: {item.lifetime_years} years</p>}
                <p>50% depreciated at {formatDate(depreciationInfo.halfLifeDate.toISOString())}</p>
                <p>100% depreciated at {formatDate(depreciationInfo.endDate.toISOString())}</p>
              </div>
              <DepreciationChart points={depreciationInfo.points} today={today} />
            </div>
          )}
        </div>

        {labelData && (
          <div className="w-full max-w-[220px] rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">QR Code</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={labelData.qrDataUrl} alt="Item QR Code" className="mx-auto h-40 w-40" />
          </div>
        )}
      </div>
    </div>
  );
}
