import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { rooms } from "../db/schema";
import type { Room } from "../types";
import type { RoomInput } from "../validation/room";

const repository = createTableRepository(rooms, "Rooms");

export async function listRooms(): Promise<Room[]> {
  return repository.list();
}

export async function listRoomsByFloor(floorId: string): Promise<Room[]> {
  return repository.list(eq(rooms.floor_id, floorId));
}

export async function listRoomsByProperty(propertyId: string): Promise<Room[]> {
  return repository.list(eq(rooms.property_id, propertyId));
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
