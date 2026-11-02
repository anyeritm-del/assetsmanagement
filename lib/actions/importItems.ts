"use server";

import { revalidatePath } from "next/cache";
import { createItem, listItemsByProperty } from "../repositories/items";
import { listBuildingsByProperty } from "../repositories/buildings";
import { listFloorsByProperty } from "../repositories/floors";
import { listRoomsByProperty } from "../repositories/rooms";
import { listDepartments } from "../repositories/departments";
import { listEquipment } from "../repositories/equipment";
import { listArticles } from "../repositories/articles";
import { listArticleGroups } from "../repositories/articleGroups";
import { createImportResolver, type ImportItemRow } from "../itemImport";
import { assertCanMutate } from "../viewOnlyGuard";

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

  const [buildings, floors, rooms, departments, equipment, articles, articleGroups, existingItems] =
    await Promise.all([
      listBuildingsByProperty(propertyId),
      listFloorsByProperty(propertyId),
      listRoomsByProperty(propertyId),
      listDepartments(),
      listEquipment(),
      listArticles(),
      listArticleGroups(),
      listItemsByProperty(propertyId),
    ]);

  const resolve = createImportResolver(propertyId, {
    buildings,
    floors,
    rooms,
    departments,
    equipment,
    articles,
    articleGroups,
  });
  const existingCodes = new Set(
    existingItems.filter((item) => item.code).map((item) => normalize(item.code)),
  );

  const results: ImportRowResult[] = [];

  // Rows are created one at a time so each gets its own result (a bad row doesn't block the rest)
  // and a code repeated inside the same file is caught by existingCodes.
  for (const { rowNumber, data } of rows) {
    try {
      const code = data.code?.trim() ?? "";
      if (code && existingCodes.has(normalize(code))) {
        results.push({ rowNumber, status: "skipped_duplicate" });
        continue;
      }

      const resolved = resolve(data);
      if (!resolved.ok) {
        results.push({ rowNumber, status: "error", error: resolved.error });
        continue;
      }

      await createItem(resolved.input, null, resolved.createdAt);
      if (code) existingCodes.add(normalize(code));
      results.push({ rowNumber, status: "created" });
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
