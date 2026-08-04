"use server";

import { revalidatePath } from "next/cache";
import { itemInputSchema } from "../validation/item";
import { createItem, listItemsByProperty } from "../repositories/items";
import { listBuildingsByProperty } from "../repositories/buildings";
import { listRoomsByProperty } from "../repositories/rooms";
import { listDepartments } from "../repositories/departments";
import { listEquipment } from "../repositories/equipment";
import { listArticles } from "../repositories/articles";
import { listEmployees } from "../repositories/employees";
import { listPurchaseOrdersByProperty } from "../repositories/purchaseOrders";
import { ITEM_STATUSES } from "../constants";
import { assertCanMutate } from "../viewOnlyGuard";

export interface ImportItemRow {
  name: string;
  category?: string;
  code?: string;
  serial_number?: string;
  brand?: string;
  item_type?: string;
  quantity?: string;
  acquisition_value?: string;
  book_value?: string;
  status?: string;
  notes?: string;
  building?: string;
  room?: string;
  department?: string;
  equipment?: string;
  article?: string;
  assigned_employee?: string;
  purchase_order?: string;
  warranty_months?: string;
  lifetime_years?: string;
  end_of_lifetime_date?: string;
}

export interface ImportRowInput {
  rowNumber: number;
  data: ImportItemRow;
}

export interface ImportRowResult {
  rowNumber: number;
  status: "created" | "skipped_duplicate" | "error";
  error?: string;
}

export interface ImportBatchResult {
  success: boolean;
  error?: string;
  results?: ImportRowResult[];
}

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

export async function importItemsBatchAction(
  propertyId: string,
  rows: ImportRowInput[],
): Promise<ImportBatchResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  if (!propertyId) {
    return { success: false, error: "No property selected" };
  }
  if (rows.length === 0) {
    return { success: true, results: [] };
  }

  const [buildings, rooms, departments, equipmentList, articles, employees, purchaseOrders, existingItems] =
    await Promise.all([
      listBuildingsByProperty(propertyId),
      listRoomsByProperty(propertyId),
      listDepartments(),
      listEquipment(),
      listArticles(),
      listEmployees(),
      listPurchaseOrdersByProperty(propertyId),
      listItemsByProperty(propertyId),
    ]);

  const buildingsByName = new Map(buildings.map((entity) => [normalize(entity.name), entity]));
  const roomsByName = new Map(rooms.map((entity) => [normalize(entity.name), entity]));
  const departmentsByName = new Map(departments.map((entity) => [normalize(entity.name), entity]));
  const equipmentByName = new Map(equipmentList.map((entity) => [normalize(entity.name), entity]));
  const articlesByName = new Map(articles.map((entity) => [normalize(entity.name), entity]));
  const employeesByName = new Map(employees.map((entity) => [normalize(entity.name), entity]));
  const purchaseOrdersByNumber = new Map(
    purchaseOrders
      .filter((po) => po.purchase_number)
      .map((po) => [normalize(po.purchase_number), po]),
  );
  const existingCodes = new Set(
    existingItems.filter((item) => item.code).map((item) => normalize(item.code)),
  );

  const results: ImportRowResult[] = [];

  // Sequential, not Promise.all: matches the runPMCheckAction / seed-script pattern -- each
  // createItem() is a Sheets append, and staying sequential (with the sleep below) keeps us
  // under the Sheets API's per-user write-quota for the whole batch.
  for (const { rowNumber, data } of rows) {
    try {
      const code = data.code?.trim() ?? "";
      if (code && existingCodes.has(normalize(code))) {
        results.push({ rowNumber, status: "skipped_duplicate" });
        continue;
      }

      if (!data.building?.trim()) {
        results.push({ rowNumber, status: "error", error: "Building is required" });
        continue;
      }
      const building = buildingsByName.get(normalize(data.building));
      if (!building) {
        results.push({
          rowNumber,
          status: "error",
          error: `Building "${data.building}" not found in this property`,
        });
        continue;
      }

      let room: { id: string } | undefined;
      if (data.room?.trim()) {
        room = roomsByName.get(normalize(data.room));
        if (!room) {
          results.push({ rowNumber, status: "error", error: `Room "${data.room}" not found` });
          continue;
        }
      }

      let department: { id: string } | undefined;
      if (data.department?.trim()) {
        department = departmentsByName.get(normalize(data.department));
        if (!department) {
          results.push({
            rowNumber,
            status: "error",
            error: `Department "${data.department}" not found`,
          });
          continue;
        }
      }

      let equipment: { id: string } | undefined;
      if (data.equipment?.trim()) {
        equipment = equipmentByName.get(normalize(data.equipment));
        if (!equipment) {
          results.push({
            rowNumber,
            status: "error",
            error: `Equipment "${data.equipment}" not found`,
          });
          continue;
        }
      }

      let article: { id: string } | undefined;
      if (data.article?.trim()) {
        article = articlesByName.get(normalize(data.article));
        if (!article) {
          results.push({ rowNumber, status: "error", error: `Article "${data.article}" not found` });
          continue;
        }
      }

      let employee: { id: string } | undefined;
      if (data.assigned_employee?.trim()) {
        employee = employeesByName.get(normalize(data.assigned_employee));
        if (!employee) {
          results.push({
            rowNumber,
            status: "error",
            error: `Employee "${data.assigned_employee}" not found`,
          });
          continue;
        }
      }

      let purchaseOrder: { id: string } | undefined;
      if (data.purchase_order?.trim()) {
        purchaseOrder = purchaseOrdersByNumber.get(normalize(data.purchase_order));
        if (!purchaseOrder) {
          results.push({
            rowNumber,
            status: "error",
            error: `Purchase order "${data.purchase_order}" not found`,
          });
          continue;
        }
      }

      const itemType = normalize(data.item_type) === "consumable" ? "consumable" : "fixed_asset";
      const statusInput = normalize(data.status);
      const status = (ITEM_STATUSES as readonly string[]).includes(statusInput)
        ? (statusInput as (typeof ITEM_STATUSES)[number])
        : "active";

      const parsed = itemInputSchema.safeParse({
        property_id: propertyId,
        building_id: building.id,
        room_id: room?.id ?? null,
        department_id: department?.id ?? null,
        equipment_id: equipment?.id ?? null,
        article_id: article?.id ?? null,
        assigned_employee_id: employee?.id ?? null,
        purchase_order_id: purchaseOrder?.id ?? null,
        name: data.name,
        category: data.category ?? "",
        code,
        serial_number: data.serial_number ?? "",
        brand: data.brand ?? "",
        item_type: itemType,
        quantity: data.quantity || "1",
        acquisition_value: data.acquisition_value || "0",
        book_value: data.book_value || "0",
        lifetime_years: data.lifetime_years ?? "",
        end_of_lifetime_date: data.end_of_lifetime_date ?? "",
        warranty_months: data.warranty_months ?? "",
        status,
        notes: data.notes ?? "",
      });

      if (!parsed.success) {
        results.push({
          rowNumber,
          status: "error",
          error: parsed.error.issues[0]?.message ?? "Invalid row",
        });
        continue;
      }

      await createItem(parsed.data);
      if (code) existingCodes.add(normalize(code));
      results.push({ rowNumber, status: "created" });

      await new Promise((resolve) => setTimeout(resolve, 1200));
    } catch (err) {
      results.push({
        rowNumber,
        status: "error",
        error: err instanceof Error ? err.message : "Failed to create item",
      });
    }
  }

  revalidatePath("/items");
  return { success: true, results };
}
