CREATE TABLE "article_groups" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"article_group_id" uuid NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"code" text DEFAULT '' NOT NULL,
	"unit" text DEFAULT '' NOT NULL,
	"content" numeric(18, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"property_id" uuid NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"total_floor" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "buildings_status_check" CHECK ("buildings"."status" in ('active', 'inactive'))
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" text DEFAULT '' NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disposal_request_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"disposal_request_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disposal_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"property_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"photo_drive_file_id" text,
	"photo_view_link" text,
	"approver_user_id" uuid NOT NULL,
	"requester_name" text DEFAULT '' NOT NULL,
	"requester_email" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"decided_by" text,
	"decided_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "disposal_requests_reason_check" CHECK ("disposal_requests"."reason" in ('broken', 'lost', 'donated', 'sold')),
	CONSTRAINT "disposal_requests_status_check" CHECK ("disposal_requests"."status" in ('pending', 'approved', 'rejected'))
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" text DEFAULT '' NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"id" uuid PRIMARY KEY NOT NULL,
	"property_id" uuid NOT NULL,
	"building_id" uuid NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "floors_status_check" CHECK ("floors"."status" in ('active', 'inactive'))
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"property_id" uuid NOT NULL,
	"building_id" uuid NOT NULL,
	"room_id" uuid,
	"department_id" uuid,
	"equipment_id" uuid,
	"article_id" uuid,
	"assigned_employee_id" uuid,
	"purchase_order_id" uuid,
	"name" text DEFAULT '' NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"code" text DEFAULT '' NOT NULL,
	"serial_number" text DEFAULT '' NOT NULL,
	"brand" text DEFAULT '' NOT NULL,
	"item_type" text DEFAULT 'fixed_asset' NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"acquisition_value" numeric(18, 2) DEFAULT 0 NOT NULL,
	"book_value" numeric(18, 2) DEFAULT 0 NOT NULL,
	"lifetime_years" integer,
	"end_of_lifetime_date" date,
	"warranty_months" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"photo_drive_file_id" text,
	"photo_view_link" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "items_item_type_check" CHECK ("items"."item_type" in ('fixed_asset', 'consumable')),
	CONSTRAINT "items_status_check" CHECK ("items"."status" in ('active', 'maintenance', 'disposed')),
	CONSTRAINT "items_quantity_check" CHECK ("items"."quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "maintenance_area_types" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"property_id" uuid NOT NULL,
	"department_id" uuid,
	"requester_name" text DEFAULT '' NOT NULL,
	"requester_email" text DEFAULT '' NOT NULL,
	"building_id" uuid NOT NULL,
	"floor_id" uuid,
	"area_type_id" uuid,
	"room_number" text DEFAULT '' NOT NULL,
	"category_id" uuid,
	"priority" text DEFAULT 'medium' NOT NULL,
	"item_id" uuid,
	"problem" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"requires_shutdown" boolean DEFAULT false NOT NULL,
	"requires_external_vendor" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"photo_drive_file_id" text,
	"photo_view_link" text,
	"pm_schedule_id" uuid,
	"assigned_to_employee_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "maintenance_requests_priority_check" CHECK ("maintenance_requests"."priority" in ('low', 'medium', 'high', 'critical')),
	CONSTRAINT "maintenance_requests_status_check" CHECK ("maintenance_requests"."status" in ('open', 'in_progress', 'completed', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "movement_request_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"movement_request_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movement_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"property_id" uuid NOT NULL,
	"destination_building_id" uuid NOT NULL,
	"destination_room_id" uuid,
	"note" text DEFAULT '' NOT NULL,
	"approver_user_id" uuid NOT NULL,
	"requester_name" text DEFAULT '' NOT NULL,
	"requester_email" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"decided_by" text,
	"decided_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "movement_requests_status_check" CHECK ("movement_requests"."status" in ('pending', 'approved', 'rejected'))
);
--> statement-breakpoint
CREATE TABLE "outgoing_record_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"outgoing_record_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outgoing_record_items_quantity_check" CHECK ("outgoing_record_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "outgoing_records" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_property_id" uuid NOT NULL,
	"destination_property_id" uuid NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"expected_return_date" date,
	"requested_by_name" text DEFAULT '' NOT NULL,
	"requested_by_email" text DEFAULT '' NOT NULL,
	"fc_status" text DEFAULT 'pending' NOT NULL,
	"fc_decided_by" text,
	"fc_decided_at" timestamp (3) with time zone,
	"fc_notes" text DEFAULT '' NOT NULL,
	"hr_status" text DEFAULT 'pending' NOT NULL,
	"hr_decided_by" text,
	"hr_decided_at" timestamp (3) with time zone,
	"hr_notes" text DEFAULT '' NOT NULL,
	"gm_status" text DEFAULT 'pending' NOT NULL,
	"gm_decided_by" text,
	"gm_decided_at" timestamp (3) with time zone,
	"gm_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outgoing_records_fc_status_check" CHECK ("outgoing_records"."fc_status" in ('pending', 'approved', 'rejected')),
	CONSTRAINT "outgoing_records_hr_status_check" CHECK ("outgoing_records"."hr_status" in ('pending', 'approved', 'rejected')),
	CONSTRAINT "outgoing_records_gm_status_check" CHECK ("outgoing_records"."gm_status" in ('pending', 'approved', 'rejected'))
);
--> statement-breakpoint
CREATE TABLE "pm_schedules" (
	"id" uuid PRIMARY KEY NOT NULL,
	"property_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"frequency_interval" integer DEFAULT 1 NOT NULL,
	"frequency_unit" text DEFAULT 'month' NOT NULL,
	"start_date" date NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"default_technician_employee_id" uuid,
	"last_run_date" date,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pm_schedules_frequency_interval_check" CHECK ("pm_schedules"."frequency_interval" > 0),
	CONSTRAINT "pm_schedules_frequency_unit_check" CHECK ("pm_schedules"."frequency_unit" in ('day', 'week', 'month', 'year')),
	CONSTRAINT "pm_schedules_priority_check" CHECK ("pm_schedules"."priority" in ('low', 'medium', 'high', 'critical'))
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"code" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "properties_status_check" CHECK ("properties"."status" in ('active', 'inactive'))
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"property_id" uuid NOT NULL,
	"supplier_id" uuid,
	"received_date" date NOT NULL,
	"purchase_number" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"value" numeric(18, 2) DEFAULT 0 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"photo_drive_file_id" text,
	"photo_view_link" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY NOT NULL,
	"property_id" uuid NOT NULL,
	"building_id" uuid NOT NULL,
	"floor_id" uuid NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_status_check" CHECK ("rooms"."status" in ('active', 'inactive'))
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"email" text NOT NULL,
	"level" text DEFAULT 'user' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"password_hash" text DEFAULT '' NOT NULL,
	"assigned_property_id" uuid,
	"can_manage_maintenance" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_level_check" CHECK ("users"."level" in ('administrator', 'property_admin', 'user_admin', 'user', 'technician', 'view_only', 'owner')),
	CONSTRAINT "users_status_check" CHECK ("users"."status" in ('active', 'inactive'))
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_article_group_id_article_groups_id_fk" FOREIGN KEY ("article_group_id") REFERENCES "public"."article_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disposal_request_items" ADD CONSTRAINT "disposal_request_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disposal_request_items" ADD CONSTRAINT "disposal_request_items_disposal_request_id_fk" FOREIGN KEY ("disposal_request_id") REFERENCES "public"."disposal_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disposal_requests" ADD CONSTRAINT "disposal_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disposal_requests" ADD CONSTRAINT "disposal_requests_approver_user_id_users_id_fk" FOREIGN KEY ("approver_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_assigned_employee_id_employees_id_fk" FOREIGN KEY ("assigned_employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_area_type_id_maintenance_area_types_id_fk" FOREIGN KEY ("area_type_id") REFERENCES "public"."maintenance_area_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_category_id_maintenance_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."maintenance_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_pm_schedule_id_pm_schedules_id_fk" FOREIGN KEY ("pm_schedule_id") REFERENCES "public"."pm_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_assigned_to_employee_id_employees_id_fk" FOREIGN KEY ("assigned_to_employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movement_request_items" ADD CONSTRAINT "movement_request_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movement_request_items" ADD CONSTRAINT "movement_request_items_movement_request_id_fk" FOREIGN KEY ("movement_request_id") REFERENCES "public"."movement_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movement_requests" ADD CONSTRAINT "movement_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movement_requests" ADD CONSTRAINT "movement_requests_destination_building_id_buildings_id_fk" FOREIGN KEY ("destination_building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movement_requests" ADD CONSTRAINT "movement_requests_destination_room_id_rooms_id_fk" FOREIGN KEY ("destination_room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movement_requests" ADD CONSTRAINT "movement_requests_approver_user_id_users_id_fk" FOREIGN KEY ("approver_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_record_items" ADD CONSTRAINT "outgoing_record_items_outgoing_record_id_outgoing_records_id_fk" FOREIGN KEY ("outgoing_record_id") REFERENCES "public"."outgoing_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_record_items" ADD CONSTRAINT "outgoing_record_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_records" ADD CONSTRAINT "outgoing_records_source_property_id_properties_id_fk" FOREIGN KEY ("source_property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_records" ADD CONSTRAINT "outgoing_records_destination_property_id_properties_id_fk" FOREIGN KEY ("destination_property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_schedules" ADD CONSTRAINT "pm_schedules_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_schedules" ADD CONSTRAINT "pm_schedules_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_schedules" ADD CONSTRAINT "pm_schedules_default_technician_employee_id_employees_id_fk" FOREIGN KEY ("default_technician_employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_assigned_property_id_properties_id_fk" FOREIGN KEY ("assigned_property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_article_group_id_idx" ON "articles" USING btree ("article_group_id");--> statement-breakpoint
CREATE INDEX "buildings_property_id_idx" ON "buildings" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "disposal_request_items_disposal_request_id_idx" ON "disposal_request_items" USING btree ("disposal_request_id");--> statement-breakpoint
CREATE INDEX "disposal_request_items_item_id_idx" ON "disposal_request_items" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "disposal_requests_property_id_idx" ON "disposal_requests" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "employees_email_idx" ON "employees" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "floors_property_id_idx" ON "floors" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "floors_building_id_idx" ON "floors" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "items_property_id_idx" ON "items" USING btree ("property_id","status");--> statement-breakpoint
CREATE INDEX "items_building_id_idx" ON "items" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "items_room_id_idx" ON "items" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "items_purchase_order_id_idx" ON "items" USING btree ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "items_assigned_employee_id_idx" ON "items" USING btree ("assigned_employee_id");--> statement-breakpoint
CREATE INDEX "maintenance_requests_property_id_idx" ON "maintenance_requests" USING btree ("property_id","status");--> statement-breakpoint
CREATE INDEX "maintenance_requests_item_id_idx" ON "maintenance_requests" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "maintenance_requests_pm_schedule_id_idx" ON "maintenance_requests" USING btree ("pm_schedule_id");--> statement-breakpoint
CREATE INDEX "maintenance_requests_assigned_to_employee_id_idx" ON "maintenance_requests" USING btree ("assigned_to_employee_id");--> statement-breakpoint
CREATE INDEX "movement_request_items_movement_request_id_idx" ON "movement_request_items" USING btree ("movement_request_id");--> statement-breakpoint
CREATE INDEX "movement_request_items_item_id_idx" ON "movement_request_items" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "movement_requests_property_id_idx" ON "movement_requests" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "outgoing_record_items_outgoing_record_id_idx" ON "outgoing_record_items" USING btree ("outgoing_record_id");--> statement-breakpoint
CREATE INDEX "outgoing_record_items_item_id_idx" ON "outgoing_record_items" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "outgoing_records_source_property_id_idx" ON "outgoing_records" USING btree ("source_property_id");--> statement-breakpoint
CREATE INDEX "pm_schedules_property_id_idx" ON "pm_schedules" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "pm_schedules_item_id_idx" ON "pm_schedules" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "purchase_orders_property_id_idx" ON "purchase_orders" USING btree ("property_id","received_date");--> statement-breakpoint
CREATE INDEX "rooms_property_id_idx" ON "rooms" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "rooms_floor_id_idx" ON "rooms" USING btree ("floor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree (lower("email"));