import { db } from "@/lib/db/database";
import type { UserProfile } from "@/types/user.types";

export async function upsertKnownUser(user: UserProfile): Promise<void> {
  const existing = await db.users.get(user.id);
  await db.users.put({ ...existing, ...user });
}

export async function getKnownUser(id: string): Promise<UserProfile | undefined> {
  return db.users.get(id);
}

export async function getAllKnownUsers(): Promise<UserProfile[]> {
  return db.users.toArray();
}
