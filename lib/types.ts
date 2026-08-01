import type { BuildingStatus, ItemStatus, PropertyStatus } from "./constants";

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

export interface Item {
  id: string;
  property_id: string;
  building_id: string;
  floor_number: number | null;
  name: string;
  category: string;
  code: string;
  quantity: number;
  status: ItemStatus;
  notes: string;
  photo_drive_file_id: string | null;
  photo_view_link: string | null;
  created_at: string;
  updated_at: string;
}
