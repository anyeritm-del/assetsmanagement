import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  APPROVAL_STAGE_STATUSES,
  BUILDING_STATUSES,
  DISPOSAL_REASONS,
  FLOOR_STATUSES,
  ITEM_STATUSES,
  ITEM_TYPES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_REQUEST_STATUSES,
  PM_FREQUENCY_UNITS,
  PROPERTY_STATUSES,
  ROOM_STATUSES,
  USER_LEVELS,
  USER_STATUSES,
} from "../constants";
import type {
  ApprovalStageStatus,
  BuildingStatus,
  DisposalReason,
  FloorStatus,
  ItemStatus,
  ItemType,
  MaintenancePriority,
  MaintenanceRequestStatus,
  PMFrequencyUnit,
  PropertyStatus,
  RoomStatus,
  UserLevel,
  UserStatus,
} from "../constants";
import { isoTimestamp, money, oneOf } from "./columns";

// Every table mirrors one former Google Sheets tab (and the matching interface in lib/types.ts).
// No table is partitioned: row counts are small, so composite (property_id, ...) indexes are
// enough. Nothing in the app deletes rows, so foreign keys keep the default ON DELETE NO ACTION.

const timestamps = {
  created_at: isoTimestamp("created_at").notNull().default(sql`now()`),
  updated_at: isoTimestamp("updated_at").notNull().default(sql`now()`),
};

const photo = {
  photo_drive_file_id: text("photo_drive_file_id"),
  photo_view_link: text("photo_view_link"),
};

// ---------------------------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------------------------

export const properties = pgTable(
  "properties",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull().default(""),
    code: text("code").notNull().default(""),
    status: text("status").$type<PropertyStatus>().notNull().default("active"),
    ...timestamps,
  },
  (t) => [check("properties_status_check", oneOf(t.status, PROPERTY_STATUSES))],
);

export const buildings = pgTable(
  "buildings",
  {
    id: uuid("id").primaryKey(),
    property_id: uuid("property_id")
      .notNull()
      .references(() => properties.id),
    name: text("name").notNull().default(""),
    description: text("description").notNull().default(""),
    total_floor: integer("total_floor").notNull().default(0),
    status: text("status").$type<BuildingStatus>().notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    index("buildings_property_id_idx").on(t.property_id),
    check("buildings_status_check", oneOf(t.status, BUILDING_STATUSES)),
  ],
);

export const floors = pgTable(
  "floors",
  {
    id: uuid("id").primaryKey(),
    property_id: uuid("property_id")
      .notNull()
      .references(() => properties.id),
    building_id: uuid("building_id")
      .notNull()
      .references(() => buildings.id),
    name: text("name").notNull().default(""),
    description: text("description").notNull().default(""),
    status: text("status").$type<FloorStatus>().notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    index("floors_property_id_idx").on(t.property_id),
    index("floors_building_id_idx").on(t.building_id),
    check("floors_status_check", oneOf(t.status, FLOOR_STATUSES)),
  ],
);

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").primaryKey(),
    property_id: uuid("property_id")
      .notNull()
      .references(() => properties.id),
    building_id: uuid("building_id")
      .notNull()
      .references(() => buildings.id),
    floor_id: uuid("floor_id")
      .notNull()
      .references(() => floors.id),
    name: text("name").notNull().default(""),
    description: text("description").notNull().default(""),
    status: text("status").$type<RoomStatus>().notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    index("rooms_property_id_idx").on(t.property_id),
    index("rooms_floor_id_idx").on(t.floor_id),
    check("rooms_status_check", oneOf(t.status, ROOM_STATUSES)),
  ],
);

// ---------------------------------------------------------------------------------------------
// Master data (shared across all properties)
// ---------------------------------------------------------------------------------------------

export const departments = pgTable("departments", {
  id: uuid("id").primaryKey(),
  code: text("code").notNull().default(""),
  name: text("name").notNull().default(""),
  ...timestamps,
});

export const equipment = pgTable("equipment", {
  id: uuid("id").primaryKey(),
  code: text("code").notNull().default(""),
  name: text("name").notNull().default(""),
  description: text("description").notNull().default(""),
  ...timestamps,
});

export const articleGroups = pgTable("article_groups", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull().default(""),
  ...timestamps,
});

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey(),
    article_group_id: uuid("article_group_id")
      .notNull()
      .references(() => articleGroups.id),
    name: text("name").notNull().default(""),
    code: text("code").notNull().default(""),
    unit: text("unit").notNull().default(""),
    content: money("content").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("articles_article_group_id_idx").on(t.article_group_id)],
);

export const employees = pgTable(
  "employees",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull().default(""),
    email: text("email").notNull().default(""),
    ...timestamps,
  },
  (t) => [index("employees_email_idx").on(sql`lower(${t.email})`)],
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull().default(""),
    email: text("email").notNull(),
    level: text("level").$type<UserLevel>().notNull().default("user"),
    status: text("status").$type<UserStatus>().notNull().default("active"),
    password_hash: text("password_hash").notNull().default(""),
    assigned_property_id: uuid("assigned_property_id").references(() => properties.id),
    can_manage_maintenance: boolean("can_manage_maintenance").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    // Sign-in/authorization looks users up by email, so two rows with the same email would make
    // the result depend on row order. Enforce it here instead of hoping the UI prevents it.
    uniqueIndex("users_email_unique").on(sql`lower(${t.email})`),
    check("users_level_check", oneOf(t.level, USER_LEVELS)),
    check("users_status_check", oneOf(t.status, USER_STATUSES)),
  ],
);

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  description: text("description").notNull().default(""),
  ...timestamps,
});

export const maintenanceCategories = pgTable("maintenance_categories", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull().default(""),
  ...timestamps,
});

export const maintenanceAreaTypes = pgTable("maintenance_area_types", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull().default(""),
  ...timestamps,
});

// ---------------------------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------------------------

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: uuid("id").primaryKey(),
    property_id: uuid("property_id")
      .notNull()
      .references(() => properties.id),
    supplier_id: uuid("supplier_id").references(() => suppliers.id),
    received_date: date("received_date", { mode: "string" }).notNull(),
    purchase_number: text("purchase_number").notNull().default(""),
    title: text("title").notNull().default(""),
    value: money("value").notNull().default(0),
    description: text("description").notNull().default(""),
    quantity: integer("quantity").notNull().default(0),
    ...photo,
    ...timestamps,
  },
  (t) => [index("purchase_orders_property_id_idx").on(t.property_id, t.received_date)],
);

export const items = pgTable(
  "items",
  {
    id: uuid("id").primaryKey(),
    property_id: uuid("property_id")
      .notNull()
      .references(() => properties.id),
    building_id: uuid("building_id")
      .notNull()
      .references(() => buildings.id),
    room_id: uuid("room_id").references(() => rooms.id),
    department_id: uuid("department_id").references(() => departments.id),
    equipment_id: uuid("equipment_id").references(() => equipment.id),
    article_id: uuid("article_id").references(() => articles.id),
    assigned_employee_id: uuid("assigned_employee_id").references(() => employees.id),
    purchase_order_id: uuid("purchase_order_id").references(() => purchaseOrders.id),
    name: text("name").notNull().default(""),
    category: text("category").notNull().default(""),
    code: text("code").notNull().default(""),
    serial_number: text("serial_number").notNull().default(""),
    brand: text("brand").notNull().default(""),
    item_type: text("item_type").$type<ItemType>().notNull().default("fixed_asset"),
    quantity: integer("quantity").notNull().default(0),
    acquisition_value: money("acquisition_value").notNull().default(0),
    book_value: money("book_value").notNull().default(0),
    lifetime_years: integer("lifetime_years"),
    end_of_lifetime_date: date("end_of_lifetime_date", { mode: "string" }),
    warranty_months: integer("warranty_months"),
    status: text("status").$type<ItemStatus>().notNull().default("active"),
    notes: text("notes").notNull().default(""),
    ...photo,
    ...timestamps,
  },
  (t) => [
    index("items_property_id_idx").on(t.property_id, t.status),
    index("items_building_id_idx").on(t.building_id),
    index("items_room_id_idx").on(t.room_id),
    index("items_purchase_order_id_idx").on(t.purchase_order_id),
    index("items_assigned_employee_id_idx").on(t.assigned_employee_id),
    check("items_item_type_check", oneOf(t.item_type, ITEM_TYPES)),
    check("items_status_check", oneOf(t.status, ITEM_STATUSES)),
    check("items_quantity_check", sql`${t.quantity} >= 0`),
  ],
);

// ---------------------------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------------------------

export const outgoingRecords = pgTable(
  "outgoing_records",
  {
    id: uuid("id").primaryKey(),
    source_property_id: uuid("source_property_id")
      .notNull()
      .references(() => properties.id),
    destination_property_id: uuid("destination_property_id")
      .notNull()
      .references(() => properties.id),
    reason: text("reason").notNull().default(""),
    expected_return_date: date("expected_return_date", { mode: "string" }),
    requested_by_name: text("requested_by_name").notNull().default(""),
    requested_by_email: text("requested_by_email").notNull().default(""),
    fc_status: text("fc_status").$type<ApprovalStageStatus>().notNull().default("pending"),
    fc_decided_by: text("fc_decided_by"),
    fc_decided_at: isoTimestamp("fc_decided_at"),
    fc_notes: text("fc_notes").notNull().default(""),
    hr_status: text("hr_status").$type<ApprovalStageStatus>().notNull().default("pending"),
    hr_decided_by: text("hr_decided_by"),
    hr_decided_at: isoTimestamp("hr_decided_at"),
    hr_notes: text("hr_notes").notNull().default(""),
    gm_status: text("gm_status").$type<ApprovalStageStatus>().notNull().default("pending"),
    gm_decided_by: text("gm_decided_by"),
    gm_decided_at: isoTimestamp("gm_decided_at"),
    gm_notes: text("gm_notes").notNull().default(""),
    ...timestamps,
  },
  (t) => [
    index("outgoing_records_source_property_id_idx").on(t.source_property_id),
    check("outgoing_records_fc_status_check", oneOf(t.fc_status, APPROVAL_STAGE_STATUSES)),
    check("outgoing_records_hr_status_check", oneOf(t.hr_status, APPROVAL_STAGE_STATUSES)),
    check("outgoing_records_gm_status_check", oneOf(t.gm_status, APPROVAL_STAGE_STATUSES)),
  ],
);

export const outgoingRecordItems = pgTable(
  "outgoing_record_items",
  {
    id: uuid("id").primaryKey(),
    outgoing_record_id: uuid("outgoing_record_id")
      .notNull()
      .references(() => outgoingRecords.id),
    item_id: uuid("item_id")
      .notNull()
      .references(() => items.id),
    quantity: integer("quantity").notNull().default(1),
    created_at: timestamps.created_at,
  },
  (t) => [
    index("outgoing_record_items_outgoing_record_id_idx").on(t.outgoing_record_id),
    index("outgoing_record_items_item_id_idx").on(t.item_id),
    check("outgoing_record_items_quantity_check", sql`${t.quantity} > 0`),
  ],
);

export const pmSchedules = pgTable(
  "pm_schedules",
  {
    id: uuid("id").primaryKey(),
    property_id: uuid("property_id")
      .notNull()
      .references(() => properties.id),
    item_id: uuid("item_id")
      .notNull()
      .references(() => items.id),
    title: text("title").notNull().default(""),
    description: text("description").notNull().default(""),
    frequency_interval: integer("frequency_interval").notNull().default(1),
    frequency_unit: text("frequency_unit").$type<PMFrequencyUnit>().notNull().default("month"),
    start_date: date("start_date", { mode: "string" }).notNull(),
    priority: text("priority").$type<MaintenancePriority>().notNull().default("medium"),
    default_technician_employee_id: uuid("default_technician_employee_id").references(
      () => employees.id,
    ),
    last_run_date: date("last_run_date", { mode: "string" }),
    ...timestamps,
  },
  (t) => [
    index("pm_schedules_property_id_idx").on(t.property_id),
    index("pm_schedules_item_id_idx").on(t.item_id),
    check("pm_schedules_frequency_interval_check", sql`${t.frequency_interval} > 0`),
    check("pm_schedules_frequency_unit_check", oneOf(t.frequency_unit, PM_FREQUENCY_UNITS)),
    check("pm_schedules_priority_check", oneOf(t.priority, MAINTENANCE_PRIORITIES)),
  ],
);

export const maintenanceRequests = pgTable(
  "maintenance_requests",
  {
    id: uuid("id").primaryKey(),
    property_id: uuid("property_id")
      .notNull()
      .references(() => properties.id),
    department_id: uuid("department_id").references(() => departments.id),
    requester_name: text("requester_name").notNull().default(""),
    requester_email: text("requester_email").notNull().default(""),
    building_id: uuid("building_id")
      .notNull()
      .references(() => buildings.id),
    floor_id: uuid("floor_id").references(() => floors.id),
    area_type_id: uuid("area_type_id").references(() => maintenanceAreaTypes.id),
    room_number: text("room_number").notNull().default(""),
    category_id: uuid("category_id").references(() => maintenanceCategories.id),
    priority: text("priority").$type<MaintenancePriority>().notNull().default("medium"),
    item_id: uuid("item_id").references(() => items.id),
    problem: text("problem").notNull().default(""),
    description: text("description").notNull().default(""),
    requires_shutdown: boolean("requires_shutdown").notNull().default(false),
    requires_external_vendor: boolean("requires_external_vendor").notNull().default(false),
    status: text("status").$type<MaintenanceRequestStatus>().notNull().default("open"),
    ...photo,
    pm_schedule_id: uuid("pm_schedule_id").references(() => pmSchedules.id),
    assigned_to_employee_id: uuid("assigned_to_employee_id").references(() => employees.id),
    ...timestamps,
  },
  (t) => [
    index("maintenance_requests_property_id_idx").on(t.property_id, t.status),
    index("maintenance_requests_item_id_idx").on(t.item_id),
    index("maintenance_requests_pm_schedule_id_idx").on(t.pm_schedule_id),
    index("maintenance_requests_assigned_to_employee_id_idx").on(t.assigned_to_employee_id),
    check("maintenance_requests_priority_check", oneOf(t.priority, MAINTENANCE_PRIORITIES)),
    check("maintenance_requests_status_check", oneOf(t.status, MAINTENANCE_REQUEST_STATUSES)),
  ],
);

export const disposalRequests = pgTable(
  "disposal_requests",
  {
    id: uuid("id").primaryKey(),
    property_id: uuid("property_id")
      .notNull()
      .references(() => properties.id),
    reason: text("reason").$type<DisposalReason>().notNull(),
    note: text("note").notNull().default(""),
    ...photo,
    approver_user_id: uuid("approver_user_id")
      .notNull()
      .references(() => users.id),
    requester_name: text("requester_name").notNull().default(""),
    requester_email: text("requester_email").notNull().default(""),
    status: text("status").$type<ApprovalStageStatus>().notNull().default("pending"),
    decided_by: text("decided_by"),
    decided_at: isoTimestamp("decided_at"),
    ...timestamps,
  },
  (t) => [
    index("disposal_requests_property_id_idx").on(t.property_id),
    check("disposal_requests_reason_check", oneOf(t.reason, DISPOSAL_REASONS)),
    check("disposal_requests_status_check", oneOf(t.status, APPROVAL_STAGE_STATUSES)),
  ],
);

export const disposalRequestItems = pgTable(
  "disposal_request_items",
  {
    id: uuid("id").primaryKey(),
    disposal_request_id: uuid("disposal_request_id").notNull(),
    item_id: uuid("item_id")
      .notNull()
      .references(() => items.id),
    created_at: timestamps.created_at,
  },
  (t) => [
    // Named explicitly: drizzle's generated name exceeds Postgres's 63-character identifier limit.
    foreignKey({
      name: "disposal_request_items_disposal_request_id_fk",
      columns: [t.disposal_request_id],
      foreignColumns: [disposalRequests.id],
    }),
    index("disposal_request_items_disposal_request_id_idx").on(t.disposal_request_id),
    index("disposal_request_items_item_id_idx").on(t.item_id),
  ],
);

export const movementRequests = pgTable(
  "movement_requests",
  {
    id: uuid("id").primaryKey(),
    property_id: uuid("property_id")
      .notNull()
      .references(() => properties.id),
    destination_building_id: uuid("destination_building_id")
      .notNull()
      .references(() => buildings.id),
    destination_room_id: uuid("destination_room_id").references(() => rooms.id),
    note: text("note").notNull().default(""),
    approver_user_id: uuid("approver_user_id")
      .notNull()
      .references(() => users.id),
    requester_name: text("requester_name").notNull().default(""),
    requester_email: text("requester_email").notNull().default(""),
    status: text("status").$type<ApprovalStageStatus>().notNull().default("pending"),
    decided_by: text("decided_by"),
    decided_at: isoTimestamp("decided_at"),
    ...timestamps,
  },
  (t) => [
    index("movement_requests_property_id_idx").on(t.property_id),
    check("movement_requests_status_check", oneOf(t.status, APPROVAL_STAGE_STATUSES)),
  ],
);

export const movementRequestItems = pgTable(
  "movement_request_items",
  {
    id: uuid("id").primaryKey(),
    movement_request_id: uuid("movement_request_id").notNull(),
    item_id: uuid("item_id")
      .notNull()
      .references(() => items.id),
    created_at: timestamps.created_at,
  },
  (t) => [
    // Named explicitly: drizzle's generated name exceeds Postgres's 63-character identifier limit.
    foreignKey({
      name: "movement_request_items_movement_request_id_fk",
      columns: [t.movement_request_id],
      foreignColumns: [movementRequests.id],
    }),
    index("movement_request_items_movement_request_id_idx").on(t.movement_request_id),
    index("movement_request_items_item_id_idx").on(t.item_id),
  ],
);
