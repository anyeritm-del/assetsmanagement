/* One-off seed script for the "Demo hotel" property. Run with:
 *   node --env-file=.env.local ./node_modules/.bin/tsx scripts/seed-demo-hotel.ts
 * Idempotent for location/master data (matches by name before creating), so it's safe to re-run
 * after a partial failure (e.g. hitting the Sheets API per-minute write quota).
 */
import { createBuilding, listBuildingsByProperty } from "../lib/repositories/buildings";
import { createFloor, listFloorsByProperty } from "../lib/repositories/floors";
import { createRoom, listRoomsByProperty } from "../lib/repositories/rooms";
import { listEmployees, createEmployee } from "../lib/repositories/employees";
import { listSuppliers, createSupplier } from "../lib/repositories/suppliers";
import { listArticleGroups } from "../lib/repositories/articleGroups";
import { listArticles, createArticle } from "../lib/repositories/articles";
import { listPurchaseOrdersByProperty, createPurchaseOrder } from "../lib/repositories/purchaseOrders";
import { listItemsByProperty, createItem, updateItem } from "../lib/repositories/items";
import { listDepartments } from "../lib/repositories/departments";
import { listEquipment } from "../lib/repositories/equipment";
import {
  listMaintenanceCategories,
  createMaintenanceCategory,
} from "../lib/repositories/maintenanceCategories";
import {
  listMaintenanceAreaTypes,
  createMaintenanceAreaType,
} from "../lib/repositories/maintenanceAreaTypes";
import {
  listAllMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceRequestStatus,
  updateMaintenanceRequestAssignment,
} from "../lib/repositories/maintenanceRequests";
import { listPMSchedulesByProperty, createPMSchedule } from "../lib/repositories/pmSchedules";
import {
  listAllDisposalRequests,
  createDisposalRequestWithItems,
  decideDisposalRequest,
} from "../lib/repositories/disposalRequests";
import {
  listAllMovementRequests,
  createMovementRequestWithItems,
  decideMovementRequest,
} from "../lib/repositories/movementRequests";
import {
  listAllOutgoingRecords,
  createOutgoingRecordWithItems,
  updateOutgoingRecord,
} from "../lib/repositories/outgoingRecords";
import { listUsers } from "../lib/repositories/users";
import type { Article, Building, Floor, Item, PurchaseOrder, Room } from "../lib/types";

const DEMO_PROPERTY_ID = "4a974743-7683-481e-a61c-167ffb903bdf"; // Demo hotel
const CILEGON_PROPERTY_ID = "544ac456-9a58-4c42-a352-f67d31837e83"; // ASTON Cilegon Boutique Hotel

// Stay comfortably under the Sheets API's per-minute write quota.
const RATE_LIMIT_MS = 1200;
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function write<T>(fn: () => Promise<T>): Promise<T> {
  const result = await fn();
  await sleep(RATE_LIMIT_MS);
  return result;
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function findGroupId(groups: { id: string; name: string }[], name: string): string {
  const match = groups.find((g) => g.name === name);
  if (!match) throw new Error(`Article group not found: ${name}`);
  return match.id;
}

async function getOrCreateBuilding(
  existing: Building[],
  name: string,
  description: string,
  totalFloor: number,
): Promise<Building> {
  const found = existing.find((b) => b.name === name);
  if (found) return found;
  return write(() =>
    createBuilding({
      property_id: DEMO_PROPERTY_ID,
      name,
      description,
      total_floor: totalFloor,
      status: "active",
    }),
  );
}

async function getOrCreateFloor(existing: Floor[], buildingId: string, name: string): Promise<Floor> {
  const found = existing.find((f) => f.building_id === buildingId && f.name === name);
  if (found) return found;
  return write(() =>
    createFloor({
      property_id: DEMO_PROPERTY_ID,
      building_id: buildingId,
      name,
      description: "",
      status: "active",
    }),
  );
}

async function getOrCreateRooms(
  existing: Room[],
  buildingId: string,
  floorId: string,
  names: string[],
): Promise<Room[]> {
  const rooms: Room[] = [];
  for (const name of names) {
    const found = existing.find((r) => r.floor_id === floorId && r.name === name);
    if (found) {
      rooms.push(found);
      continue;
    }
    rooms.push(
      await write(() =>
        createRoom({
          property_id: DEMO_PROPERTY_ID,
          building_id: buildingId,
          floor_id: floorId,
          name,
          description: "",
          status: "active",
        }),
      ),
    );
  }
  return rooms;
}

async function main() {
  console.log("Seeding Demo hotel...");

  // ---- Location: Buildings / Floors / Rooms (idempotent by name) ----
  const existingBuildings = await listBuildingsByProperty(DEMO_PROPERTY_ID);
  const mainBuilding = await getOrCreateBuilding(
    existingBuildings,
    "Main Building",
    "Primary guest tower",
    3,
  );
  const gardenWing = await getOrCreateBuilding(
    existingBuildings,
    "Garden Wing",
    "Low-rise wing facing the garden and pool",
    2,
  );
  console.log("Buildings ready");

  const existingFloors = await listFloorsByProperty(DEMO_PROPERTY_ID);
  const mainGround = await getOrCreateFloor(existingFloors, mainBuilding.id, "Ground Floor");
  const main1st = await getOrCreateFloor(existingFloors, mainBuilding.id, "1st Floor");
  const main2nd = await getOrCreateFloor(existingFloors, mainBuilding.id, "2nd Floor");
  const gardenGround = await getOrCreateFloor(existingFloors, gardenWing.id, "Ground Floor");
  const garden1st = await getOrCreateFloor(existingFloors, gardenWing.id, "1st Floor");
  console.log("Floors ready");

  const existingRooms = await listRoomsByProperty(DEMO_PROPERTY_ID);
  const roomsMainGround = await getOrCreateRooms(existingRooms, mainBuilding.id, mainGround.id, [
    "Lobby",
    "Front Office",
    "Restaurant",
  ]);
  const roomsMain1st = await getOrCreateRooms(existingRooms, mainBuilding.id, main1st.id, [
    "Room 101",
    "Room 102",
    "Room 103",
    "Room 104",
  ]);
  const roomsMain2nd = await getOrCreateRooms(existingRooms, mainBuilding.id, main2nd.id, [
    "Room 201",
    "Room 202",
    "Room 203",
    "Room 204",
  ]);
  const roomsGardenGround = await getOrCreateRooms(existingRooms, gardenWing.id, gardenGround.id, [
    "Garden Restaurant",
    "Pool Deck",
  ]);
  const roomsGarden1st = await getOrCreateRooms(existingRooms, gardenWing.id, garden1st.id, [
    "Room G101",
    "Room G102",
    "Room G103",
  ]);
  console.log("Rooms ready");

  // ---- Global master data: Employees, Suppliers, Articles (reuse existing where possible) ----
  const existingEmployees = await listEmployees();
  let employees = existingEmployees;
  if (existingEmployees.length === 0) {
    const names: [string, string][] = [
      ["Ahmad Fauzi", "ahmad.fauzi@astonhotelsinternational.com"],
      ["Siti Nurhaliza", "siti.nurhaliza@astonhotelsinternational.com"],
      ["Budi Santoso", "budi.santoso@astonhotelsinternational.com"],
      ["Dewi Lestari", "dewi.lestari@astonhotelsinternational.com"],
      ["Rudi Hartono", "rudi.hartono@astonhotelsinternational.com"],
      ["Maya Puspita", "maya.puspita@astonhotelsinternational.com"],
    ];
    employees = [];
    for (const [name, email] of names) {
      employees.push(await write(() => createEmployee({ name, email })));
    }
    console.log("Employees created");
  } else {
    console.log("Employees already exist, reusing");
  }

  const existingSuppliers = await listSuppliers();
  const supplierSeeds: [string, string, string, string, string][] = [
    [
      "PT Sumber Elektronik Jaya",
      "sales@sumberelektronik.co.id",
      "021-5551234",
      "Jl. Industri Raya No. 12, Jakarta",
      "Electronics and AV equipment distributor",
    ],
    [
      "CV Mitra Furniture",
      "order@mitrafurniture.co.id",
      "021-5559876",
      "Jl. Furniture Center Blok C5, Tangerang",
      "Hotel furniture and fit-out supplier",
    ],
    [
      "PT Teknik Mesin Nusantara",
      "cs@teknikmesin.co.id",
      "021-5554567",
      "Jl. Teknik Industri No. 8, Cilegon",
      "Engineering parts, HVAC, and mechanical equipment",
    ],
  ];
  const suppliers = [...existingSuppliers];
  for (const [name, email, phone, address, description] of supplierSeeds) {
    const found = existingSuppliers.find((s) => s.name === name);
    if (found) continue;
    suppliers.push(await write(() => createSupplier({ name, email, phone, address, description })));
  }
  console.log("Suppliers ready");

  const articleGroups = await listArticleGroups();
  const existingArticles = await listArticles();
  const articleSeeds: [string, string, string, string, number][] = [
    ["Air Conditioner", "Split AC 1PK Daikin", "ART-AC-001", "unit", 1],
    ["Bed & Mattress", "King Size Mattress Set", "ART-BED-001", "unit", 1],
    ["Computer Equipment", "Desktop PC Office", "ART-PC-001", "unit", 1],
    ["Furnitures", "Guest Room Wardrobe", "ART-FUR-001", "unit", 1],
    ["Kitchen Equipment", "Commercial Refrigerator", "ART-KIT-001", "unit", 1],
    ["Linen", "Bath Towel Set", "ART-LIN-001", "set", 4],
    ["Smart Devices", "Smart TV Remote Hub", "ART-SD-001", "unit", 1],
    ["Television", "Smart TV 43 Inch", "ART-TV-002", "unit", 1],
    ["Network Devices", "Wireless Access Point", "ART-NET-001", "unit", 1],
    ["Office Equipment", "Laser Printer", "ART-OFF-001", "unit", 1],
  ];
  const articles: Article[] = [];
  for (const [groupName, name, code, unit, content] of articleSeeds) {
    const found = existingArticles.find((a) => a.name === name);
    if (found) {
      articles.push(found);
      continue;
    }
    articles.push(
      await write(() =>
        createArticle({
          article_group_id: findGroupId(articleGroups, groupName),
          name,
          code,
          unit,
          content,
        }),
      ),
    );
  }
  console.log("Articles ready");

  const departments = await listDepartments();
  const equipment = await listEquipment();
  const users = await listUsers();
  const approver1 = users[0]?.id;
  const approver2 = users[1]?.id ?? users[0]?.id;
  if (!approver1) throw new Error("No Users found to use as approvers");

  function pick<T>(arr: T[], index: number): T {
    return arr[index % arr.length];
  }

  // ---- Purchase Orders (idempotent by purchase_number) ----
  const existingPOs = await listPurchaseOrdersByProperty(DEMO_PROPERTY_ID);
  const poSeeds: [string, string, number, number, string][] = [
    ["PO-2026-001", "Room AC Replacement Batch 1", 45000000, 6, "2026-02-10"],
    ["PO-2026-002", "Lobby Furniture Refresh", 32000000, 4, "2026-03-15"],
    ["PO-2026-003", "Kitchen Equipment Upgrade", 58000000, 3, "2026-04-02"],
    ["PO-2026-004", "IT Equipment Replenishment", 21000000, 8, "2026-05-20"],
    ["PO-2026-005", "Linen & Housekeeping Supplies", 9500000, 20, "2026-06-05"],
  ];
  const purchaseOrders: PurchaseOrder[] = [];
  for (let i = 0; i < poSeeds.length; i++) {
    const [purchase_number, title, value, quantity, received_date] = poSeeds[i];
    const found = existingPOs.find((po) => po.purchase_number === purchase_number);
    if (found) {
      purchaseOrders.push(found);
      continue;
    }
    purchaseOrders.push(
      await write(() =>
        createPurchaseOrder({
          property_id: DEMO_PROPERTY_ID,
          supplier_id: pick(suppliers, i).id,
          received_date,
          purchase_number,
          title,
          value,
          description: `${title} for Demo hotel`,
          quantity,
        }),
      ),
    );
  }
  console.log("Purchase orders ready");

  // ---- Items (idempotent by code) ----
  const allRooms = [
    ...roomsMainGround,
    ...roomsMain1st,
    ...roomsMain2nd,
    ...roomsGardenGround,
    ...roomsGarden1st,
  ];
  const existingItems = await listItemsByProperty(DEMO_PROPERTY_ID);

  interface ItemSeed {
    name: string;
    code: string;
    serial_number: string;
    brand: string;
    category: string;
    item_type: "fixed_asset" | "consumable";
    quantity: number;
    acquisition_value: number;
    book_value: number;
    status: "active" | "maintenance" | "disposed";
    lifetime_years: number | null;
    end_of_lifetime_date: string | null;
    warranty_months: number | null;
    purchaseOrderIndex: number | null;
    articleIndex: number;
    roomIndex: number;
    equipmentIndex: number;
    departmentIndex: number;
    assignedEmployeeIndex: number | null;
    notes: string;
  }

  const itemSeeds: ItemSeed[] = [
    // end_of_lifetime_date below is always received_date (of the linked PO) + lifetime_years, so
    // the Depreciation section (which derives its schedule from these two fields, not from
    // book_value) stays internally consistent instead of showing a lifetime/end-date mismatch.
    { name: "Split AC Room 101", code: "AST-AC-101", serial_number: "SN-AC-1001", brand: "Daikin", category: "HVAC", item_type: "fixed_asset", quantity: 1, acquisition_value: 6500000, book_value: 4200000, status: "active", lifetime_years: 5, end_of_lifetime_date: "2031-02-10", warranty_months: 24, purchaseOrderIndex: 0, articleIndex: 0, roomIndex: 3, equipmentIndex: 0, departmentIndex: 0, assignedEmployeeIndex: null, notes: "" },
    { name: "Split AC Room 102", code: "AST-AC-102", serial_number: "SN-AC-1002", brand: "Daikin", category: "HVAC", item_type: "fixed_asset", quantity: 1, acquisition_value: 6500000, book_value: 3900000, status: "active", lifetime_years: 5, end_of_lifetime_date: "2031-02-10", warranty_months: 24, purchaseOrderIndex: 0, articleIndex: 0, roomIndex: 4, equipmentIndex: 0, departmentIndex: 0, assignedEmployeeIndex: null, notes: "" },
    { name: "Split AC Room 201", code: "AST-AC-201", serial_number: "SN-AC-1003", brand: "Daikin", category: "HVAC", item_type: "fixed_asset", quantity: 1, acquisition_value: 6500000, book_value: 2000000, status: "maintenance", lifetime_years: 5, end_of_lifetime_date: "2031-02-10", warranty_months: 24, purchaseOrderIndex: 0, articleIndex: 0, roomIndex: 8, equipmentIndex: 0, departmentIndex: 0, assignedEmployeeIndex: null, notes: "Compressor noise reported" },
    { name: "King Mattress Room 101", code: "AST-BED-101", serial_number: "SN-BED-2001", brand: "Simmons", category: "Furniture", item_type: "fixed_asset", quantity: 1, acquisition_value: 8000000, book_value: 6400000, status: "active", lifetime_years: 8, end_of_lifetime_date: "2034-03-15", warranty_months: 36, purchaseOrderIndex: 1, articleIndex: 1, roomIndex: 3, equipmentIndex: 13, departmentIndex: 3, assignedEmployeeIndex: null, notes: "" },
    { name: "King Mattress Room 102", code: "AST-BED-102", serial_number: "SN-BED-2002", brand: "Simmons", category: "Furniture", item_type: "fixed_asset", quantity: 1, acquisition_value: 8000000, book_value: 6000000, status: "active", lifetime_years: 8, end_of_lifetime_date: "2034-03-15", warranty_months: 36, purchaseOrderIndex: 1, articleIndex: 1, roomIndex: 4, equipmentIndex: 13, departmentIndex: 3, assignedEmployeeIndex: null, notes: "" },
    { name: "Front Office Desktop PC", code: "AST-PC-001", serial_number: "SN-PC-3001", brand: "Dell", category: "IT Equipment", item_type: "fixed_asset", quantity: 1, acquisition_value: 9500000, book_value: 5700000, status: "active", lifetime_years: 4, end_of_lifetime_date: "2030-05-20", warranty_months: 12, purchaseOrderIndex: 3, articleIndex: 2, roomIndex: 1, equipmentIndex: 1, departmentIndex: 3, assignedEmployeeIndex: 0, notes: "" },
    { name: "IT Office Desktop PC", code: "AST-PC-002", serial_number: "SN-PC-3002", brand: "Dell", category: "IT Equipment", item_type: "fixed_asset", quantity: 1, acquisition_value: 9500000, book_value: 5200000, status: "active", lifetime_years: 4, end_of_lifetime_date: "2030-05-20", warranty_months: 12, purchaseOrderIndex: 3, articleIndex: 2, roomIndex: 1, equipmentIndex: 1, departmentIndex: 7, assignedEmployeeIndex: 1, notes: "" },
    { name: "Guest Room Wardrobe 101", code: "AST-FUR-101", serial_number: "SN-FUR-4001", brand: "Olympic", category: "Furniture", item_type: "fixed_asset", quantity: 1, acquisition_value: 4200000, book_value: 3100000, status: "active", lifetime_years: 10, end_of_lifetime_date: "2036-03-15", warranty_months: null, purchaseOrderIndex: 1, articleIndex: 3, roomIndex: 3, equipmentIndex: 18, departmentIndex: 3, assignedEmployeeIndex: null, notes: "" },
    { name: "Guest Room Wardrobe 201", code: "AST-FUR-201", serial_number: "SN-FUR-4002", brand: "Olympic", category: "Furniture", item_type: "fixed_asset", quantity: 1, acquisition_value: 4200000, book_value: 2900000, status: "active", lifetime_years: 10, end_of_lifetime_date: "2036-03-15", warranty_months: null, purchaseOrderIndex: 1, articleIndex: 3, roomIndex: 8, equipmentIndex: 18, departmentIndex: 3, assignedEmployeeIndex: null, notes: "" },
    { name: "Kitchen Commercial Fridge", code: "AST-KIT-001", serial_number: "SN-KIT-5001", brand: "Hoshizaki", category: "Kitchen Equipment", item_type: "fixed_asset", quantity: 1, acquisition_value: 22000000, book_value: 17000000, status: "active", lifetime_years: 7, end_of_lifetime_date: "2033-04-02", warranty_months: 24, purchaseOrderIndex: 2, articleIndex: 4, roomIndex: 2, equipmentIndex: 3, departmentIndex: 4, assignedEmployeeIndex: 2, notes: "" },
    { name: "Garden Restaurant Fridge", code: "AST-KIT-002", serial_number: "SN-KIT-5002", brand: "Hoshizaki", category: "Kitchen Equipment", item_type: "fixed_asset", quantity: 1, acquisition_value: 22000000, book_value: 15500000, status: "active", lifetime_years: 7, end_of_lifetime_date: "2033-04-02", warranty_months: 24, purchaseOrderIndex: 2, articleIndex: 4, roomIndex: 11, equipmentIndex: 3, departmentIndex: 4, assignedEmployeeIndex: 2, notes: "" },
    { name: "Bath Towel Set - Housekeeping Store", code: "AST-LIN-001", serial_number: "", brand: "Vinorosso", category: "Linen", item_type: "consumable", quantity: 120, acquisition_value: 12000000, book_value: 8000000, status: "active", lifetime_years: null, end_of_lifetime_date: null, warranty_months: null, purchaseOrderIndex: 4, articleIndex: 5, roomIndex: 0, equipmentIndex: 8, departmentIndex: 3, assignedEmployeeIndex: null, notes: "Housekeeping stock" },
    { name: "Smart TV Remote Hub Room 103", code: "AST-SD-103", serial_number: "SN-SD-6001", brand: "Broadlink", category: "Electronics", item_type: "fixed_asset", quantity: 1, acquisition_value: 950000, book_value: 500000, status: "active", lifetime_years: 3, end_of_lifetime_date: "2029-05-20", warranty_months: 12, purchaseOrderIndex: 3, articleIndex: 6, roomIndex: 5, equipmentIndex: 12, departmentIndex: 3, assignedEmployeeIndex: null, notes: "" },
    { name: "Smart TV 43 Inch Room 101", code: "AST-TV-001", serial_number: "SN-TV-7001", brand: "Samsung", category: "Electronics", item_type: "fixed_asset", quantity: 1, acquisition_value: 5500000, book_value: 3800000, status: "active", lifetime_years: 5, end_of_lifetime_date: "2031-05-20", warranty_months: 24, purchaseOrderIndex: 3, articleIndex: 7, roomIndex: 3, equipmentIndex: 12, departmentIndex: 3, assignedEmployeeIndex: null, notes: "" },
    { name: "Smart TV 43 Inch Room 208", code: "AST-TV-004", serial_number: "SN-TV-7002", brand: "Samsung", category: "Electronics", item_type: "fixed_asset", quantity: 1, acquisition_value: 5500000, book_value: 3200000, status: "maintenance", lifetime_years: 5, end_of_lifetime_date: "2031-05-20", warranty_months: 24, purchaseOrderIndex: 3, articleIndex: 7, roomIndex: 9, equipmentIndex: 12, departmentIndex: 3, assignedEmployeeIndex: null, notes: "No signal, being checked" },
    { name: "Wireless AP - Lobby", code: "AST-NET-001", serial_number: "SN-NET-8001", brand: "Ubiquiti", category: "Network", item_type: "fixed_asset", quantity: 1, acquisition_value: 3200000, book_value: 2100000, status: "active", lifetime_years: 5, end_of_lifetime_date: "2031-05-20", warranty_months: 36, purchaseOrderIndex: 3, articleIndex: 8, roomIndex: 0, equipmentIndex: 1, departmentIndex: 7, assignedEmployeeIndex: 1, notes: "" },
    { name: "Wireless AP - 1st Floor", code: "AST-NET-002", serial_number: "SN-NET-8002", brand: "Ubiquiti", category: "Network", item_type: "fixed_asset", quantity: 1, acquisition_value: 3200000, book_value: 1900000, status: "active", lifetime_years: 5, end_of_lifetime_date: "2031-05-20", warranty_months: 36, purchaseOrderIndex: 3, articleIndex: 8, roomIndex: 5, equipmentIndex: 1, departmentIndex: 7, assignedEmployeeIndex: 1, notes: "" },
    { name: "Laser Printer - Front Office", code: "AST-OFF-001", serial_number: "SN-OFF-9001", brand: "HP", category: "Office Equipment", item_type: "fixed_asset", quantity: 1, acquisition_value: 4500000, book_value: 2600000, status: "active", lifetime_years: 4, end_of_lifetime_date: "2030-05-20", warranty_months: 12, purchaseOrderIndex: 3, articleIndex: 9, roomIndex: 1, equipmentIndex: 0, departmentIndex: 3, assignedEmployeeIndex: 0, notes: "" },
    { name: "Laser Printer - HR Office", code: "AST-OFF-002", serial_number: "SN-OFF-9002", brand: "HP", category: "Office Equipment", item_type: "fixed_asset", quantity: 1, acquisition_value: 4500000, book_value: 1200000, status: "disposed", lifetime_years: 4, end_of_lifetime_date: "2030-05-20", warranty_months: 12, purchaseOrderIndex: 3, articleIndex: 9, roomIndex: 1, equipmentIndex: 0, departmentIndex: 2, assignedEmployeeIndex: null, notes: "Replaced, kept for spare parts" },
    { name: "Pool Deck Sun Lounger x10", code: "AST-FUR-301", serial_number: "", brand: "Kettal", category: "Furniture", item_type: "fixed_asset", quantity: 10, acquisition_value: 15000000, book_value: 11000000, status: "active", lifetime_years: 6, end_of_lifetime_date: "2032-03-15", warranty_months: null, purchaseOrderIndex: 1, articleIndex: 3, roomIndex: 12, equipmentIndex: 18, departmentIndex: 3, assignedEmployeeIndex: null, notes: "" },
    { name: "Kitchen Utensil Set - Main Kitchen", code: "AST-KIT-003", serial_number: "", brand: "Victorinox", category: "Kitchen Equipment", item_type: "consumable", quantity: 25, acquisition_value: 6000000, book_value: 4000000, status: "active", lifetime_years: null, end_of_lifetime_date: null, warranty_months: null, purchaseOrderIndex: 2, articleIndex: 4, roomIndex: 2, equipmentIndex: 23, departmentIndex: 4, assignedEmployeeIndex: 2, notes: "" },
    { name: "Access Point Indoor Dual Band MR36", code: "AST-NET-003", serial_number: "SN-NET-8003", brand: "Cisco Meraki", category: "Network", item_type: "fixed_asset", quantity: 1, acquisition_value: 4100000, book_value: 2500000, status: "active", lifetime_years: 5, end_of_lifetime_date: "2031-05-20", warranty_months: 24, purchaseOrderIndex: 3, articleIndex: 8, roomIndex: 6, equipmentIndex: 1, departmentIndex: 7, assignedEmployeeIndex: 1, notes: "" },
  ];

  const createdItems: Item[] = [];
  for (const seed of itemSeeds) {
    const found = existingItems.find((i) => i.code === seed.code);
    if (found) {
      // Self-heal rows created by an earlier, buggy version of this script where
      // end_of_lifetime_date was set to daysFromNow(N) instead of received_date + lifetime_years.
      if (found.end_of_lifetime_date !== seed.end_of_lifetime_date) {
        createdItems.push(
          await write(() => updateItem(found.id, { end_of_lifetime_date: seed.end_of_lifetime_date })),
        );
      } else {
        createdItems.push(found);
      }
      continue;
    }
    const item = await write(() =>
      createItem({
        property_id: DEMO_PROPERTY_ID,
        building_id: allRooms[seed.roomIndex].building_id,
        room_id: allRooms[seed.roomIndex].id,
        department_id: pick(departments, seed.departmentIndex).id,
        equipment_id: pick(equipment, seed.equipmentIndex).id,
        article_id: articles[seed.articleIndex].id,
        assigned_employee_id:
          seed.assignedEmployeeIndex !== null ? pick(employees, seed.assignedEmployeeIndex).id : null,
        purchase_order_id:
          seed.purchaseOrderIndex !== null ? purchaseOrders[seed.purchaseOrderIndex].id : null,
        name: seed.name,
        category: seed.category,
        code: seed.code,
        serial_number: seed.serial_number,
        brand: seed.brand,
        item_type: seed.item_type,
        quantity: seed.quantity,
        acquisition_value: seed.acquisition_value,
        book_value: seed.book_value,
        lifetime_years: seed.lifetime_years,
        end_of_lifetime_date: seed.end_of_lifetime_date,
        warranty_months: seed.warranty_months,
        status: seed.status,
        notes: seed.notes,
      }),
    );
    createdItems.push(item);
  }
  console.log(`Items ready: ${createdItems.length}`);

  // ---- Maintenance Categories / Area Types (reuse if already present) ----
  let maintenanceCategories = await listMaintenanceCategories();
  if (maintenanceCategories.length === 0) {
    const names = ["Electrical", "Plumbing", "HVAC/AC", "IT & Network", "Furniture & Fixtures"];
    maintenanceCategories = [];
    for (const name of names) {
      maintenanceCategories.push(await write(() => createMaintenanceCategory({ name })));
    }
    console.log("Maintenance categories created");
  }

  let maintenanceAreaTypes = await listMaintenanceAreaTypes();
  if (maintenanceAreaTypes.length === 0) {
    const names = ["Guest Room", "Lobby", "Kitchen", "Corridor", "Back of House"];
    maintenanceAreaTypes = [];
    for (const name of names) {
      maintenanceAreaTypes.push(await write(() => createMaintenanceAreaType({ name })));
    }
    console.log("Maintenance area types created");
  }

  // ---- Maintenance Requests ----
  const existingMaintenanceRequests = await listAllMaintenanceRequests();
  const demoMaintenanceRequestCount = existingMaintenanceRequests.filter(
    (r) => r.property_id === DEMO_PROPERTY_ID,
  ).length;

  if (demoMaintenanceRequestCount === 0) {
    const maintenanceRequestSeeds: {
      problem: string;
      description: string;
      priority: "low" | "medium" | "high" | "critical";
      status: "open" | "in_progress" | "completed" | "cancelled";
      categoryIndex: number;
      areaTypeIndex: number;
      departmentIndex: number;
      itemIndex: number;
      roomIndex: number;
      roomNumber: string;
      assignedEmployeeIndex: number | null;
      requiresShutdown: boolean;
      requiresExternalVendor: boolean;
    }[] = [
      { problem: "AC not cooling in Room 201", description: "Guest reported AC blowing warm air since this morning.", priority: "high", status: "in_progress", categoryIndex: 2, areaTypeIndex: 0, departmentIndex: 0, itemIndex: 2, roomIndex: 8, roomNumber: "201", assignedEmployeeIndex: 2, requiresShutdown: false, requiresExternalVendor: false },
      { problem: "Smart TV no signal in Room 208", description: "TV shows no signal error, remote pairing also failing.", priority: "medium", status: "open", categoryIndex: 3, areaTypeIndex: 0, departmentIndex: 3, itemIndex: 14, roomIndex: 9, roomNumber: "208", assignedEmployeeIndex: null, requiresShutdown: false, requiresExternalVendor: false },
      { problem: "Leaking pipe under kitchen sink", description: "Water pooling under the main kitchen prep sink, needs urgent fix.", priority: "critical", status: "open", categoryIndex: 1, areaTypeIndex: 2, departmentIndex: 4, itemIndex: 9, roomIndex: 2, roomNumber: "", assignedEmployeeIndex: 2, requiresShutdown: true, requiresExternalVendor: false },
      { problem: "Lobby WiFi access point offline", description: "Guests reporting no WiFi near the lobby seating area.", priority: "high", status: "completed", categoryIndex: 3, areaTypeIndex: 1, departmentIndex: 7, itemIndex: 15, roomIndex: 0, roomNumber: "", assignedEmployeeIndex: 1, requiresShutdown: false, requiresExternalVendor: false },
      { problem: "Wardrobe door hinge broken", description: "Wardrobe door in Room 101 won't close properly, hinge appears bent.", priority: "low", status: "open", categoryIndex: 4, areaTypeIndex: 0, departmentIndex: 3, itemIndex: 7, roomIndex: 3, roomNumber: "101", assignedEmployeeIndex: null, requiresShutdown: false, requiresExternalVendor: false },
      { problem: "Printer jamming repeatedly", description: "Front office printer jams every few prints, needs vendor service.", priority: "medium", status: "cancelled", categoryIndex: 3, areaTypeIndex: 4, departmentIndex: 3, itemIndex: 17, roomIndex: 1, roomNumber: "", assignedEmployeeIndex: 0, requiresShutdown: false, requiresExternalVendor: true },
    ];

    for (const seed of maintenanceRequestSeeds) {
      const item = createdItems[seed.itemIndex];
      const request = await write(() =>
        createMaintenanceRequest(
          {
            property_id: DEMO_PROPERTY_ID,
            department_id: pick(departments, seed.departmentIndex).id,
            requester_name: pick(employees, seed.departmentIndex).name,
            building_id: item.building_id,
            floor_id: null,
            area_type_id: pick(maintenanceAreaTypes, seed.areaTypeIndex).id,
            room_number: seed.roomNumber,
            category_id: pick(maintenanceCategories, seed.categoryIndex).id,
            priority: seed.priority,
            item_id: item.id,
            problem: seed.problem,
            description: seed.description,
            requires_shutdown: seed.requiresShutdown,
            requires_external_vendor: seed.requiresExternalVendor,
          },
          "demo.requester@astonhotelsinternational.com",
        ),
      );
      if (seed.status !== "open") {
        await write(() => updateMaintenanceRequestStatus(request.id, seed.status));
      }
      if (seed.assignedEmployeeIndex !== null) {
        await write(() =>
          updateMaintenanceRequestAssignment(request.id, pick(employees, seed.assignedEmployeeIndex!).id),
        );
      }
    }
    console.log("Maintenance requests created");
  } else {
    console.log("Maintenance requests already exist, skipping");
  }

  // ---- PM Schedules ----
  const existingPMSchedules = await listPMSchedulesByProperty(DEMO_PROPERTY_ID);
  if (existingPMSchedules.length === 0) {
    const pmSeeds: {
      itemIndex: number;
      title: string;
      description: string;
      interval: number;
      unit: "day" | "week" | "month" | "year";
      startDaysAgo: number;
      priority: "low" | "medium" | "high" | "critical";
      lastRunDaysAgo: number | null;
      technicianIndex: number | null;
    }[] = [
      { itemIndex: 0, title: "AC Filter Cleaning", description: "Clean and inspect AC filters and coils.", interval: 3, unit: "month", startDaysAgo: 200, priority: "medium", lastRunDaysAgo: 80, technicianIndex: 2 },
      { itemIndex: 9, title: "Fridge Coil & Gasket Check", description: "Inspect condenser coils and door gaskets for wear.", interval: 6, unit: "month", startDaysAgo: 300, priority: "medium", lastRunDaysAgo: 190, technicianIndex: 2 },
      { itemIndex: 15, title: "Network Access Point Firmware Check", description: "Verify firmware is current and signal strength is nominal.", interval: 1, unit: "month", startDaysAgo: 60, priority: "low", lastRunDaysAgo: null, technicianIndex: 1 },
      { itemIndex: 3, title: "Mattress Rotation & Inspection", description: "Rotate mattress and inspect for wear/stains.", interval: 6, unit: "month", startDaysAgo: 400, priority: "low", lastRunDaysAgo: 175, technicianIndex: null },
    ];
    for (const seed of pmSeeds) {
      await write(() =>
        createPMSchedule({
          property_id: DEMO_PROPERTY_ID,
          item_id: createdItems[seed.itemIndex].id,
          title: seed.title,
          description: seed.description,
          frequency_interval: seed.interval,
          frequency_unit: seed.unit,
          start_date: daysFromNow(-seed.startDaysAgo),
          priority: seed.priority,
          default_technician_employee_id:
            seed.technicianIndex !== null ? pick(employees, seed.technicianIndex).id : null,
          last_run_date: seed.lastRunDaysAgo !== null ? daysFromNow(-seed.lastRunDaysAgo) : null,
        }),
      );
    }
    console.log("PM schedules created");
  } else {
    console.log("PM schedules already exist, skipping");
  }

  // ---- Disposal Requests ----
  const existingDisposalRequests = (await listAllDisposalRequests()).filter(
    (r) => r.property_id === DEMO_PROPERTY_ID,
  );
  if (existingDisposalRequests.length === 0) {
    const disposalApproved = await write(() =>
      createDisposalRequestWithItems(
        {
          property_id: DEMO_PROPERTY_ID,
          reason: "broken",
          note: "Printer beyond economical repair, replaced with new unit.",
          approver_user_id: approver1,
          item_ids: [createdItems[18].id], // Laser Printer - HR Office
        },
        "Demo Requester",
        "demo.requester@astonhotelsinternational.com",
      ),
    );
    await write(() =>
      decideDisposalRequest(disposalApproved.id, "approved", "Ahmad Fauzi", [createdItems[18].id]),
    );

    await write(() =>
      createDisposalRequestWithItems(
        {
          property_id: DEMO_PROPERTY_ID,
          reason: "lost",
          note: "Item not found during last stock opname, presumed lost.",
          approver_user_id: approver2,
          item_ids: [createdItems[12].id], // Bath Towel Set stock
        },
        "Demo Requester",
        "demo.requester@astonhotelsinternational.com",
      ),
    );
    console.log("Disposal requests created");
  } else {
    console.log("Disposal requests already exist, skipping");
  }

  // ---- Movement Requests ----
  const existingMovementRequests = (await listAllMovementRequests()).filter(
    (r) => r.property_id === DEMO_PROPERTY_ID,
  );
  if (existingMovementRequests.length === 0) {
    const movementApproved = await write(() =>
      createMovementRequestWithItems(
        {
          property_id: DEMO_PROPERTY_ID,
          destination_building_id: gardenWing.id,
          destination_room_id: roomsGarden1st[0].id,
          note: "Relocating spare AP to cover Garden Wing weak signal area.",
          approver_user_id: approver1,
          item_ids: [createdItems[16].id], // Wireless AP - 1st Floor
        },
        "Demo Requester",
        "demo.requester@astonhotelsinternational.com",
      ),
    );
    await write(() =>
      decideMovementRequest(
        movementApproved.id,
        "approved",
        "Siti Nurhaliza",
        [createdItems[16].id],
        gardenWing.id,
        roomsGarden1st[0].id,
      ),
    );

    await write(() =>
      createMovementRequestWithItems(
        {
          property_id: DEMO_PROPERTY_ID,
          destination_building_id: mainBuilding.id,
          destination_room_id: roomsMain2nd[1].id,
          note: "Requesting to move spare sun lounger set indoors for storage during renovation.",
          approver_user_id: approver2,
          item_ids: [createdItems[19].id], // Pool Deck Sun Lounger x10
        },
        "Demo Requester",
        "demo.requester@astonhotelsinternational.com",
      ),
    );
    console.log("Movement requests created");
  } else {
    console.log("Movement requests already exist, skipping");
  }

  // ---- Outgoing Records (loan to ASTON Cilegon) ----
  const existingOutgoingRecords = (await listAllOutgoingRecords()).filter(
    (r) => r.source_property_id === DEMO_PROPERTY_ID,
  );
  if (existingOutgoingRecords.length === 0) {
    const outgoingApproved = await write(() =>
      createOutgoingRecordWithItems(
        {
          source_property_id: DEMO_PROPERTY_ID,
          destination_property_id: CILEGON_PROPERTY_ID,
          items: [{ item_id: createdItems[17].id, quantity: 1 }], // Laser Printer - Front Office
          reason: "ASTON Cilegon front office printer is down, lending a spare unit temporarily.",
          expected_return_date: daysFromNow(30),
        },
        "Demo Requester",
        "demo.requester@astonhotelsinternational.com",
      ),
    );
    await write(() =>
      updateOutgoingRecord(outgoingApproved.id, {
        fc_status: "approved",
        fc_decided_by: "Ahmad Fauzi",
        fc_decided_at: new Date().toISOString(),
        fc_notes: "Approved, low value asset.",
        hr_status: "approved",
        hr_decided_by: "Siti Nurhaliza",
        hr_decided_at: new Date().toISOString(),
        hr_notes: "No objection.",
        gm_status: "approved",
        gm_decided_by: "Budi Santoso",
        gm_decided_at: new Date().toISOString(),
        gm_notes: "Approved for inter-property support.",
      }),
    );

    const outgoingPending = await write(() =>
      createOutgoingRecordWithItems(
        {
          source_property_id: DEMO_PROPERTY_ID,
          destination_property_id: CILEGON_PROPERTY_ID,
          items: [{ item_id: createdItems[20].id, quantity: 1 }], // Kitchen Utensil Set
          reason: "Supporting ASTON Cilegon kitchen during their opening event.",
          expected_return_date: daysFromNow(14),
        },
        "Demo Requester",
        "demo.requester@astonhotelsinternational.com",
      ),
    );
    await write(() =>
      updateOutgoingRecord(outgoingPending.id, {
        fc_status: "approved",
        fc_decided_by: "Ahmad Fauzi",
        fc_decided_at: new Date().toISOString(),
        fc_notes: "Approved.",
      }),
    );
    console.log("Outgoing records created");
  } else {
    console.log("Outgoing records already exist, skipping");
  }

  console.log("\nSeeding complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
