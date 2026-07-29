const WORKSPACE_NAME_MIN = 2;
const WORKSPACE_NAME_MAX = 50;
const CHANNEL_NAME_MIN = 2;
const CHANNEL_NAME_MAX = 80;

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

export function isValidWorkspaceName(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.length >= WORKSPACE_NAME_MIN && trimmed.length <= WORKSPACE_NAME_MAX;
}

export function isValidChannelName(name: string): boolean {
    if (name.length < CHANNEL_NAME_MIN || name.length > CHANNEL_NAME_MAX) {
        return false;
    }
    return /^[a-z0-9](?:[a-z0-9-_]*[a-z0-9])?$/.test(name) || /^[a-z0-9]$/.test(name);
}

export const NAME_LIMITS = {
    WORKSPACE_NAME_MIN,
    WORKSPACE_NAME_MAX,
    CHANNEL_NAME_MIN,
    CHANNEL_NAME_MAX,
} as const;
