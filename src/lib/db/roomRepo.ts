import { db } from "@/lib/db/database";
import type { Room } from "@/types/room.types";

export async function getAllRooms(): Promise<Room[]> {
  return db.rooms.toArray();
}

export async function saveRoom(room: Room): Promise<void> {
  await db.rooms.put(room);
}

export async function deleteRoom(id: string): Promise<void> {
  await db.rooms.delete(id);
  await db.messages.where("roomId").equals(id).delete();
}
