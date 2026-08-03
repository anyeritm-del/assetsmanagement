import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { Room } from "../types";
import { roomSchema } from "../validation/room";
import type { RoomInput } from "../validation/room";

const HEADERS = [
  "id",
  "property_id",
  "building_id",
  "floor_id",
  "name",
  "description",
  "status",
  "created_at",
  "updated_at",
];

function fromRow(record: Record<string, unknown>): Room | null {
  const parsed = roomSchema.safeParse({
    id: String(record.id ?? ""),
    property_id: String(record.property_id ?? ""),
    building_id: String(record.building_id ?? ""),
    floor_id: String(record.floor_id ?? ""),
    name: String(record.name ?? ""),
    description: String(record.description ?? ""),
    status: record.status || "active",
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Rooms row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: Room): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<Room>({
  sheetName: "Rooms",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listRooms(): Promise<Room[]> {
  return repository.list();
}

export async function listRoomsByFloor(floorId: string): Promise<Room[]> {
  const all = await repository.list();
  return all.filter((room) => room.floor_id === floorId);
}

export async function listRoomsByProperty(propertyId: string): Promise<Room[]> {
  const all = await repository.list();
  return all.filter((room) => room.property_id === propertyId);
}

export async function getRoom(id: string): Promise<Room | null> {
  return repository.getById(id);
}

export async function createRoom(input: RoomInput): Promise<Room> {
  const now = new Date().toISOString();
  const entity: Room = {
    id: uuidv4(),
    ...input,
    created_at: now,
    updated_at: now,
  };
  return repository.create(entity);
}

export async function updateRoom(id: string, patch: Partial<RoomInput>): Promise<Room> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
