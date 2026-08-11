export function isValidDisplayName(name: string): boolean {
  return name.trim().length >= 3 && name.trim().length <= 50;
}

export function isValidBio(bio: string): boolean {
  return bio.length <= 150;
}

export function isValidPeerId(id: string): boolean {
  return /^[a-zA-Z0-9-]{6,64}$/.test(id.trim());
}
