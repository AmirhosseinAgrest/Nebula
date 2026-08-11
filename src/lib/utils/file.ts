// File helpers: base64 conversion, chunking for WebRTC data-channel transfer

export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Splits a base64 string into fixed-size chunks so it can be streamed
 * across a WebRTC DataChannel without exceeding buffer limits.
 */
export function chunkString(data: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

export function isAudioMime(mime: string): boolean {
  return mime.startsWith("audio/");
}
