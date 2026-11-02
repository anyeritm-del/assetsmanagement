import { itemInputSchema, type ItemInput } from "./validation/item";
import type { ItemStatus } from "./constants";
import type {
  Article,
  ArticleGroup,
  Building,
  Department,
  Equipment,
  Floor,
  Room,
} from "./types";

// CSV import for Items. The columns follow the hotels' existing asset register spreadsheet, so a
// sheet exported as CSV can be uploaded as-is. Headers are matched case-insensitively with any
// punctuation/spaces collapsed to "_" ("Item Name" -> item_name), see normalizeHeader().

export const IMPORT_TEMPLATE_HEADERS = [
  "Created Date",
  "Received Date",
  "Code",
  "Item Name",
  "Description",
  "Warranty",
  "Status",
  "Brand",
  "Acquisition Value",
  "Book Value",
  "Department",
  "Location",
  "Floor",
  "Building",
  "Article",
  "Group",
  "Equipment",
] as const;

export const IMPORT_TEMPLATE_EXAMPLE_ROW: Record<(typeof IMPORT_TEMPLATE_HEADERS)[number], string> = {
  "Created Date": "2024-11-18T05:58:48+00:00",
  "Received Date": "2024-05-03",
  Code: "001-140-002897",
  "Item Name": "SOUP BOWL BATIK",
  Description: "chinaware",
  Warranty: "1",
  Status: "inuse",
  Brand: "soup",
  "Acquisition Value": "64069",
  "Book Value": "56060",
  Department: "Food & Beverage Product Department",
  Location: "Kitchen",
  Floor: "G Floor",
  Building: "Main Building",
  Article: "Chinaware",
  Group: "Equipment Chinaware, Glassware, Silverware",
  Equipment: "Kitchen Equipment",
};

export const REQUIRED_IMPORT_COLUMNS = ["item_name", "building"] as const;

/** One CSV row keyed by normalized header. Every field is optional text, as read from the file. */
export interface ImportItemRow {
  created_date?: string;
  received_date?: string;
  code?: string;
  item_name?: string;
  description?: string;
  warranty?: string;
  status?: string;
  brand?: string;
  acquisition_value?: string;
  book_value?: string;
  department?: string;
  location?: string;
  floor?: string;
  building?: string;
  article?: string;
  group?: string;
  equipment?: string;
}

export function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** Status words used in the spreadsheet, mapped to the app's item statuses. */
const STATUS_ALIASES: Record<string, ItemStatus> = {
  inuse: "active",
  "in use": "active",
  active: "active",
  maintenance: "maintenance",
  repair: "maintenance",
  disposed: "disposed",
  dispose: "disposed",
};

/** Master data for one property, loaded once per batch. */
export interface ImportLookupData {
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];
  departments: Department[];
  equipment: Equipment[];
  articles: Article[];
  articleGroups: ArticleGroup[];
}

export type ResolvedImportRow =
  | { ok: true; code: string; input: ItemInput; createdAt: string | undefined }
  | { ok: false; error: string };

function key(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function groupBy<T>(rows: T[], keyOf: (row: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const k = keyOf(row);
    map.set(k, [...(map.get(k) ?? []), row]);
  }
  return map;
}

export function createImportResolver(propertyId: string, data: ImportLookupData) {
  const buildingsByName = groupBy(data.buildings, (b) => key(b.name));
  const floorsByBuildingAndName = groupBy(data.floors, (f) => `${f.building_id}|${key(f.name)}`);
  const roomsByBuildingAndName = groupBy(data.rooms, (r) => `${r.building_id}|${key(r.name)}`);
  // Departments/equipment can share a name (e.g. two "Food & Beverage Product Department"
  // rows); the first (oldest) one wins so the same CSV always maps the same way.
  const departmentsByName = groupBy(data.departments, (d) => key(d.name));
  const equipmentByName = groupBy(data.equipment, (e) => key(e.name));
  const articlesByName = groupBy(data.articles, (a) => key(a.name));
  const groupNameById = new Map(data.articleGroups.map((g) => [g.id, key(g.name)]));

  return function resolve(row: ImportItemRow): ResolvedImportRow {
    const fail = (error: string): ResolvedImportRow => ({ ok: false, error });
    const text = (value: string | undefined) => (value ?? "").trim();

    // --- Location -------------------------------------------------------------------------
    if (!text(row.building)) return fail("Building is required");
    const building = buildingsByName.get(key(row.building))?.[0];
    if (!building) return fail(`Building "${text(row.building)}" not found in this property`);

    let floor: Floor | undefined;
    if (text(row.floor)) {
      floor = floorsByBuildingAndName.get(`${building.id}|${key(row.floor)}`)?.[0];
      if (!floor) return fail(`Floor "${text(row.floor)}" not found in building "${building.name}"`);
    }

    let roomId: string | null = null;
    if (text(row.location)) {
      const candidates = (roomsByBuildingAndName.get(`${building.id}|${key(row.location)}`) ?? []).filter(
        (room) => !floor || room.floor_id === floor.id,
      );
      if (candidates.length === 0) {
        return fail(
          `Location "${text(row.location)}" not found in ${floor ? `floor "${floor.name}" of ` : ""}building "${building.name}"`,
        );
      }
      if (candidates.length > 1 && !floor) {
        return fail(`Location "${text(row.location)}" exists on several floors -- fill in Floor`);
      }
      roomId = candidates[0].id;
    }

    // --- Classification -------------------------------------------------------------------
    let departmentId: string | null = null;
    if (text(row.department)) {
      const department = departmentsByName.get(key(row.department))?.[0];
      if (!department) return fail(`Department "${text(row.department)}" not found`);
      departmentId = department.id;
    }

    let equipmentId: string | null = null;
    if (text(row.equipment)) {
      const equipment = equipmentByName.get(key(row.equipment))?.[0];
      if (!equipment) return fail(`Equipment "${text(row.equipment)}" not found`);
      equipmentId = equipment.id;
    }

    let articleId: string | null = null;
    if (text(row.article)) {
      const byName = articlesByName.get(key(row.article)) ?? [];
      const candidates = text(row.group)
        ? byName.filter((article) => groupNameById.get(article.article_group_id) === key(row.group))
        : byName;
      if (candidates.length === 0) {
        return fail(
          `Article "${text(row.article)}" not found${text(row.group) ? ` in group "${text(row.group)}"` : ""}`,
        );
      }
      if (candidates.length > 1 && !text(row.group)) {
        return fail(`Article "${text(row.article)}" exists in several groups -- fill in Group`);
      }
      articleId = candidates[0].id;
    }

    // --- Values ---------------------------------------------------------------------------
    const statusText = key(row.status);
    const status: ItemStatus | undefined = statusText ? STATUS_ALIASES[statusText] : "active";
    if (!status) {
      return fail(
        `Status "${text(row.status)}" is not recognised (use: ${Object.keys(STATUS_ALIASES).join(", ")})`,
      );
    }

    let createdAt: string | undefined;
    if (text(row.created_date)) {
      const parsed = new Date(text(row.created_date));
      if (Number.isNaN(parsed.getTime())) {
        return fail(`Created Date "${text(row.created_date)}" is not a valid date`);
      }
      createdAt = parsed.toISOString();
    }

    let receivedDate: string | null = null;
    if (text(row.received_date)) {
      const match = /^(\d{4}-\d{2}-\d{2})(?:$|[T ])/.exec(text(row.received_date));
      if (!match || Number.isNaN(new Date(`${match[1]}T00:00:00Z`).getTime())) {
        return fail(`Received Date "${text(row.received_date)}" must be in YYYY-MM-DD format`);
      }
      receivedDate = match[1];
    }

    // Sheets exports large numbers with thousands separators when the cell is formatted.
    const amount = (value: string | undefined) => text(value).replace(/,/g, "") || "0";
    // The old system wrote the literal text "undefined" into empty descriptions.
    const description = key(row.description) === "undefined" ? "" : text(row.description);
    const code = text(row.code);

    const parsed = itemInputSchema.safeParse({
      property_id: propertyId,
      building_id: building.id,
      room_id: roomId,
      department_id: departmentId,
      equipment_id: equipmentId,
      article_id: articleId,
      assigned_employee_id: null,
      purchase_order_id: null,
      name: row.item_name ?? "",
      category: "",
      code,
      serial_number: "",
      brand: text(row.brand),
      item_type: "fixed_asset",
      quantity: "1",
      acquisition_value: amount(row.acquisition_value),
      book_value: amount(row.book_value),
      lifetime_years: "",
      end_of_lifetime_date: "",
      warranty_months: text(row.warranty),
      received_date: receivedDate ?? "",
      status,
      notes: description,
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path.join(".");
      return fail(issue ? `${field ? `${field}: ` : ""}${issue.message}` : "Invalid row");
    }

    return { ok: true, code, input: parsed.data, createdAt };
  };
}
