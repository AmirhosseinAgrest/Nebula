// End-to-End Encryption primitives built on the native Web Crypto API.
//
// Design notes:
// - Every room (direct or group) has a symmetric AES-GCM "session key".
// - Because there is no server to broker key exchange, the session key is
//   deterministically derived (PBKDF2) from the room id, which is only ever
//   known to the participants that were invited into the room out-of-band
//   (shared Room ID / peer ID). This guarantees every member can derive the
//   exact same key locally without ever transmitting it in the clear.
// - RSA-OAEP keypair + wrap/unwrap helpers are also provided and used during
//   the P2P handshake to demonstrate/allow explicit key-exchange (e.g. for
//   future out-of-band verification or rotating keys) as required by spec.
// - All keys are kept only in memory (never persisted in IndexedDB/localStorage).

const sessionKeyCache = new Map<string, CryptoKey>();

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

/**
 * Derive (and cache) a deterministic AES-GCM session key for a given room.
 */
export async function generateSessionKey(roomId: string): Promise<CryptoKey> {
  const cached = sessionKeyCache.get(roomId);
  if (cached) return cached;

  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(roomId), "PBKDF2", false, [
    "deriveKey",
  ]);

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("nebula-p2p-e2ee-salt"),
      iterations: 150000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  sessionKeyCache.set(roomId, key);
  return key;
}

/**
 * Encrypt a plaintext string with AES-GCM. Returns base64(iv + ciphertext).
 */
export async function encryptMessage(plainText: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plainText);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return base64FromBuffer(combined.buffer);
}

/**
 * Decrypt a base64(iv + ciphertext) payload previously produced by encryptMessage.
 */
export async function decryptMessage(payload: string, key: CryptoKey): Promise<string> {
  try {
    const combined = new Uint8Array(bufferFromBase64(payload));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(decrypted);
  } catch {
    return "\u26a0\ufe0f Unable to decrypt message";
  }
}

/**
 * Generate an RSA-OAEP keypair used for explicit session-key exchange
 * (e.g. group key wrapping) as part of the handshake protocol.
 */
export async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function exportPublicKey(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey("jwk", key);
}

export async function importRSAPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey("jwk", jwk, { name: "RSA-OAEP", hash: "SHA-256" }, true, [
    "encrypt",
  ]);
}

/**
 * Encrypt an AES session key's raw bytes with a peer's RSA public key.
 */
export async function encryptWithPublicKey(rawKey: ArrayBuffer, publicKey: CryptoKey): Promise<string> {
  const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, rawKey);
  return base64FromBuffer(encrypted);
}

/**
 * Decrypt an RSA-wrapped AES session key using our private key.
 */
export async function decryptWithPrivateKey(payload: string, privateKey: CryptoKey): Promise<ArrayBuffer> {
  const data = bufferFromBase64(payload);
  return crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, data);
}

export async function exportRawAESKey(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey("raw", key);
}
