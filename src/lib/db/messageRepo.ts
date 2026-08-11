import { db } from "@/lib/db/database";
import { decryptMessage, encryptMessage, generateSessionKey } from "@/lib/crypto/keys";
import type { ChatMessage } from "@/types/message.types";

/**
 * Messages are encrypted at rest (AES-GCM) using the room's derived session
 * key, mirroring the exact same protection applied in transit. The plaintext
 * only ever exists transiently in memory (React/Zustand state) for rendering.
 */
export async function persistMessage(message: ChatMessage): Promise<void> {
  const key = await generateSessionKey(message.roomId);
  const cipherContent = message.isDeleted ? "" : await encryptMessage(message.content, key);
  await db.messages.put({ ...message, content: cipherContent });
}

export async function loadRoomMessages(roomId: string): Promise<ChatMessage[]> {
  const key = await generateSessionKey(roomId);
  const records = await db.messages.where("roomId").equals(roomId).sortBy("timestamp");
  return Promise.all(
    records.map(async (record) => ({
      ...record,
      content: record.isDeleted || !record.content ? "" : await decryptMessage(record.content, key),
    })),
  );
}

export async function deleteMessageRecord(id: string): Promise<void> {
  await db.messages.delete(id);
}

export async function getMessageById(id: string): Promise<ChatMessage | undefined> {
  return db.messages.get(id);
}
