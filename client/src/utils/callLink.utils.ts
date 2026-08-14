export function extractCallScheduleId(text: string): string | null {
  if (!text) return null;
  const match = text.match(/\/call\/([a-f0-9]{24})\b/i);
  return match?.[1] ?? null;
}

export function extractCallCreator(text: string): string | null {
  if (!text) return null;
  const match = text.match(/^([^\n]+?)\s+created a video call/i);
  const name = match?.[1]?.trim();
  return name || null;
}

export function stripCallLinks(text: string): string {
  if (!text) return text;
  return text
    .replace(/\s*Join video:\s*https?:\/\/[^\s]+\/call\/[a-f0-9]{24}\b/gi, '')
    .replace(/\s*https?:\/\/[^\s]+\/call\/[a-f0-9]{24}\b/gi, '')
    .replace(/\s*Join DevCollab video:\s*https?:\/\/[^\s]+/gi, '')
    .trim();
}
