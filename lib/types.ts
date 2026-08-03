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
} from "./constants";

export interface Property {
  id: string;
  name: string;
  code: string;
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: string;
  property_id: string;
  name: string;
  description: string;
  total_floor: number;
  status: BuildingStatus;
  created_at: string;
  updated_at: string;
}

export interface Floor {
  id: string;
  property_id: string;
  building_id: string;
  name: string;
  description: string;
  status: FloorStatus;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  property_id: string;
  building_id: string;
  floor_id: string;
  name: string;
  description: string;
  status: RoomStatus;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  property_id: string;
  supplier_id: string | null;
  received_date: string;
  purchase_number: string;
  title: string;
  value: number;
  description: string;
  quantity: number;
  photo_drive_file_id: string | null;
  photo_view_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  code: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleGroup {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  article_group_id: string;
  name: string;
  code: string;
  unit: string;
  content: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  level: UserLevel;
  status: UserStatus;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  property_id: string;
  building_id: string;
  room_id: string | null;
  department_id: string | null;
  equipment_id: string | null;
  article_id: string | null;
  assigned_employee_id: string | null;
  purchase_order_id: string | null;
  name: string;
  category: string;
  code: string;
  serial_number: string;
  brand: string;
  item_type: ItemType;
  quantity: number;
  acquisition_value: number;
  book_value: number;
  lifetime_years: number | null;
  end_of_lifetime_date: string | null;
  warranty_months: number | null;
  status: ItemStatus;
  notes: string;
  photo_drive_file_id: string | null;
  photo_view_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutgoingRecord {
  id: string;
  source_property_id: string;
  destination_property_id: string;
  reason: string;
  expected_return_date: string | null;
  requested_by_name: string;
  requested_by_email: string;
  fc_status: ApprovalStageStatus;
  fc_decided_by: string | null;
  fc_decided_at: string | null;
  fc_notes: string;
  hr_status: ApprovalStageStatus;
  hr_decided_by: string | null;
  hr_decided_at: string | null;
  hr_notes: string;
  gm_status: ApprovalStageStatus;
  gm_decided_by: string | null;
  gm_decided_at: string | null;
  gm_notes: string;
  created_at: string;
  updated_at: string;
}

export interface OutgoingRecordItem {
  id: string;
  outgoing_record_id: string;
  item_id: string;
  quantity: number;
  created_at: string;
}

export interface MaintenanceCategory {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceAreaType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  // Nullable so "Run PM Check" can auto-generate a ticket from a PMSchedule, which only knows
  // the asset -- not which department/category/area-type it belongs to. Manually filed requests
  // (the New Maintenance Request form) still always fill these in.
  department_id: string | null;
  requester_name: string;
  requester_email: string;
  building_id: string;
  floor_id: string | null;
  area_type_id: string | null;
  room_number: string;
  category_id: string | null;
  priority: MaintenancePriority;
  item_id: string | null;
  problem: string;
  description: string;
  requires_shutdown: boolean;
  requires_external_vendor: boolean;
  status: MaintenanceRequestStatus;
  photo_drive_file_id: string | null;
  photo_view_link: string | null;
  // Set only when this request was auto-generated by "Run PM Check"; null for manually filed ones.
  pm_schedule_id: string | null;
  // The technician (Employee) currently responsible for working this ticket; null until assigned.
  assigned_to_employee_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PMSchedule {
  id: string;
  property_id: string;
  item_id: string;
  title: string;
  description: string;
  frequency_interval: number;
  frequency_unit: PMFrequencyUnit;
  start_date: string;
  priority: MaintenancePriority;
  default_technician_employee_id: string | null;
  last_run_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisposalRequest {
  id: string;
  property_id: string;
  reason: DisposalReason;
  note: string;
  photo_drive_file_id: string | null;
  photo_view_link: string | null;
  // The person designated to review this request -- workflow tracking only, like OutgoingRecord:
  // any signed-in user can actually record the decision, not just this one.
  approver_user_id: string;
  requester_name: string;
  requester_email: string;
  status: ApprovalStageStatus;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisposalRequestItem {
  id: string;
  disposal_request_id: string;
  item_id: string;
  created_at: string;
}

export interface MovementRequest {
  id: string;
  property_id: string;
  destination_building_id: string;
  destination_room_id: string | null;
  note: string;
  // The person designated to review this request -- workflow tracking only, like DisposalRequest:
  // any signed-in user can actually record the decision, not just this one.
  approver_user_id: string;
  requester_name: string;
  requester_email: string;
  status: ApprovalStageStatus;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MovementRequestItem {
  id: string;
  movement_request_id: string;
  item_id: string;
  created_at: string;
}
