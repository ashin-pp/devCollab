export const CHANNEL_NAME_MIN = 2;
export const CHANNEL_NAME_MAX = 80;

/** Normalize channel slug: lowercase, spaces → hyphens, strip invalid chars. */
export function normalizeChannelName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function validateChannelName(
  name: string,
  existingNames: string[] = []
): string | null {
  const normalized = normalizeChannelName(name);
  if (!normalized) return 'Channel name is required';
  if (normalized.length < CHANNEL_NAME_MIN || normalized.length > CHANNEL_NAME_MAX) {
    return `Channel name must be ${CHANNEL_NAME_MIN}–${CHANNEL_NAME_MAX} characters`;
  }
  if (!/^[a-z0-9](?:[a-z0-9-_]*[a-z0-9])?$/.test(normalized) && !/^[a-z0-9]$/.test(normalized)) {
    return 'Use letters, numbers, hyphens, or underscores only';
  }
  const taken = existingNames.some(
    (n) => normalizeChannelName(n) === normalized
  );
  if (taken) return 'A channel with this name already exists in this workspace';
  return null;
}
