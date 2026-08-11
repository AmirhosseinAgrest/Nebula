import { db, type QueuedMessage } from "@/lib/db/database";
import type { ChatMessage } from "@/types/message.types";

type SendAttempt = (message: ChatMessage) => Promise<boolean>;

let sendAttemptHandler: SendAttempt | null = null;
let isFlushing = false;

/** Registered once by the chat store - knows how to actually push a message over WebRTC. */
export function registerSendHandler(handler: SendAttempt) {
  sendAttemptHandler = handler;
}

export async function addToQueue(message: ChatMessage): Promise<void> {
  const queued: QueuedMessage = {
    id: message.id,
    roomId: message.roomId,
    message,
    createdAt: Date.now(),
    status: "pending",
  };
  await db.queuedMessages.put(queued);
}

export async function removeFromQueue(id: string): Promise<void> {
  await db.queuedMessages.delete(id);
}

export async function getQueuedForRoom(roomId: string): Promise<QueuedMessage[]> {
  return db.queuedMessages.where("roomId").equals(roomId).toArray();
}

/** Attempts to deliver every pending queued message. Safe to call repeatedly. */
export async function flushQueue(): Promise<void> {
  if (isFlushing || !navigator.onLine || !sendAttemptHandler) return;
  isFlushing = true;
  try {
    const pending = await db.queuedMessages.where("status").equals("pending").toArray();
    for (const item of pending) {
      try {
        const ok = await sendAttemptHandler(item.message);
        if (ok) {
          await db.queuedMessages.delete(item.id);
        } else {
          await db.queuedMessages.update(item.id, { status: "failed" });
        }
      } catch {
        await db.queuedMessages.update(item.id, { status: "failed" });
      }
    }
  } finally {
    isFlushing = false;
  }
}

export function initOfflineQueueListener() {
  window.addEventListener("online", () => {
    flushQueue();
  });
}
