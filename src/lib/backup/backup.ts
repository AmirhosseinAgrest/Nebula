import { db } from "@/lib/db/database";
import { getAllRooms, saveRoom } from "@/lib/db/roomRepo";
import { db as rawDb } from "@/lib/db/database";

interface BackupPayload {
  exportedAt: number;
  rooms: unknown[];
  messages: unknown[];
}

function base64FromBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function bufferFromBase64(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKeyFromPassphrase(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 150000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Exports every chat + message as a single AES-GCM encrypted JSON file. */
export async function exportBackup(passphrase: string): Promise<Blob> {
  const rooms = await getAllRooms();
  const messages = await rawDb.messages.toArray(); // already stored encrypted at rest
  const payload: BackupPayload = { exportedAt: Date.now(), rooms, messages };

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  const file = {
    format: "nebula-p2p-backup",
    version: 1,
    salt: base64FromBuffer(salt.buffer),
    iv: base64FromBuffer(iv.buffer),
    data: base64FromBuffer(ciphertext),
  };

  return new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
}

/** Restores rooms + (still encrypted-at-rest) messages from a backup file. */
export async function importBackup(file: File, passphrase: string): Promise<void> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (parsed.format !== "nebula-p2p-backup") throw new Error("This doesn't look like a valid backup file.");

  const salt = new Uint8Array(bufferFromBase64(parsed.salt));
  const iv = new Uint8Array(bufferFromBase64(parsed.iv));
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  let decrypted: ArrayBuffer;
  try {
    decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, bufferFromBase64(parsed.data));
  } catch {
    throw new Error("Incorrect passphrase or corrupted backup file.");
  }

  const payload: BackupPayload = JSON.parse(new TextDecoder().decode(decrypted));

  await db.transaction("rw", db.rooms, db.messages, async () => {
    for (const room of payload.rooms as any[]) await saveRoom(room);
    for (const message of payload.messages as any[]) await db.messages.put(message);
  });
}
