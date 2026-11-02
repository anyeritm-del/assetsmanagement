import { addMonths, parseISO } from "date-fns";
import type { Item, PurchaseOrder } from "./types";

export function getNextCalendarMonthRange(today: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 2, 1);
  return { start, end };
}

export function isDateWithinRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end;
}

// Reports filter by a plain YYYY-MM-DD (or full ISO) string range with no time component --
// treats missing "from"/"to" as an open end on that side.
export function isDateStringInRange(
  dateStr: string,
  from: string | null,
  to: string | null,
): boolean {
  const date = dateStr.slice(0, 10);
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

/**
 * The date an item was received: its own received_date if set, else the linked purchase order's,
 * else when the item was created. Start date for warranty and depreciation.
 */
export function getItemReceivedDate(item: Item, purchaseOrder: PurchaseOrder | null | undefined): string {
  return item.received_date || purchaseOrder?.received_date || item.created_at;
}

export function getWarrantyExpiryDate(
  item: Item,
  purchaseOrdersById: Map<string, PurchaseOrder>,
): Date | null {
  if (item.warranty_months === null) return null;
  const purchaseOrder = item.purchase_order_id
    ? purchaseOrdersById.get(item.purchase_order_id)
    : null;
  const baseDateStr = getItemReceivedDate(item, purchaseOrder);
  if (!baseDateStr) return null;
  return addMonths(parseISO(baseDateStr.slice(0, 10)), item.warranty_months);
}
