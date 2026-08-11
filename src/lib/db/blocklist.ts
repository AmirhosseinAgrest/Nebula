import { db } from "@/lib/db/database";
import type { BlockedUser } from "@/types/user.types";

export async function blockUser(userId: string, displayName?: string): Promise<void> {
  await db.blockedUsers.put({ userId, displayName, blockedAt: Date.now() });
}

export async function unblockUser(userId: string): Promise<void> {
  await db.blockedUsers.delete(userId);
}

export async function isUserBlocked(userId: string): Promise<boolean> {
  const record = await db.blockedUsers.get(userId);
  return !!record;
}

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  return db.blockedUsers.toArray();
}
