import { envConfig } from "../../../config/envConfig";

/**
 * Offset of `timeZone` relative to UTC at `date` (ms to add to UTC to get wall time in TZ).
 */
function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
    const dtf = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
    const parts = dtf.formatToParts(date);
    const map: Record<string, string> = {};
    for (const p of parts) {
        if (p.type !== "literal") map[p.type] = p.value;
    }
    const hour = map.hour === "24" ? 0 : Number(map.hour);
    const asLocal = Date.UTC(
        Number(map.year),
        Number(map.month) - 1,
        Number(map.day),
        hour,
        Number(map.minute),
        Number(map.second)
    );
    return asLocal - date.getTime();
}

/**
 * Interpret Y-M-D H:M:S as wall-clock time in `timeZone` and return the UTC Date.
 */
export function wallTimeInZoneToDate(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    timeZone: string
): Date {
    const asUtcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
    let utc = asUtcGuess - getTimeZoneOffsetMs(new Date(asUtcGuess), timeZone);
    utc = asUtcGuess - getTimeZoneOffsetMs(new Date(utc), timeZone);
    return new Date(utc);
}

/**
 * Normalize LLM datetime strings so "4pm" / `T16:00:00Z` means 4:00 PM in APP_TIMEZONE
 * (not 4:00 PM UTC → 9:30 PM IST).
 *
 * - Explicit non-UTC offsets (+05:30, -04:00, …) are trusted as-is.
 * - `Z` / `+00:00` / missing offset: treat the clock face as APP_TIMEZONE wall time.
 */
export function normalizeAiDateTime(
    input: string,
    timeZone: string = envConfig.appTimezone
): Date {
    const raw = String(input || "").trim();
    if (!raw) return new Date(NaN);

    const wall = raw.match(
        /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?/
    );
    if (!wall) {
        const fallback = new Date(raw);
        return fallback;
    }

    const year = Number(wall[1]);
    const month = Number(wall[2]);
    const day = Number(wall[3]);
    const hour = Number(wall[4]);
    const minute = Number(wall[5]);
    const second = Number(wall[6] ?? "0");

    const rest = raw.slice(wall[0].length);
    const explicitOffset = rest.match(/^([+-])(\d{2}):?(\d{2})$/);
    if (explicitOffset) {
        const sign = explicitOffset[1] === "-" ? -1 : 1;
        const offMin =
            sign * (Number(explicitOffset[2]) * 60 + Number(explicitOffset[3]));
        // Non-zero offset → trust absolute instant
        if (offMin !== 0) {
            return new Date(raw);
        }
        // +00:00 → treat as app-local wall clock
        return wallTimeInZoneToDate(year, month, day, hour, minute, second, timeZone);
    }

    if (rest === "Z" || rest === "z" || rest === "") {
        return wallTimeInZoneToDate(year, month, day, hour, minute, second, timeZone);
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    return wallTimeInZoneToDate(year, month, day, hour, minute, second, timeZone);
}

/** Current instant formatted for agent prompts (explicit zone + offset). */
export function formatNowForAiPrompt(timeZone: string = envConfig.appTimezone): string {
    const now = new Date();
    const dtf = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZoneName: "longOffset",
    });
    const parts = dtf.formatToParts(now);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((p) => p.type === type)?.value ?? "";
    const hour = get("hour") === "24" ? "00" : get("hour");
    const offsetRaw = get("timeZoneName") || "GMT"; // e.g. GMT+05:30
    const offset = offsetRaw.replace("GMT", "").replace("UTC", "") || "+00:00";
    const isoLocal = `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}:${get("second")}${offset.startsWith("+") || offset.startsWith("-") ? offset : `+${offset}`}`;

    return (
        `The current date and time is ${isoLocal} (${timeZone}). ` +
        `User times like "4pm" or "before 4 pm" mean ${timeZone} wall clock — NEVER append Z. ` +
        `ALWAYS output ISO-8601 WITH this timezone offset (example: 2026-08-22T16:00:00${offset.startsWith("+") || offset.startsWith("-") ? offset : "+05:30"}).`
    );
}

export function formatAiDateTimeForUser(
    date: Date,
    timeZone: string = envConfig.appTimezone
): string {
    return new Intl.DateTimeFormat("en-IN", {
        timeZone,
        dateStyle: "medium",
        timeStyle: "short",
        hour12: true,
    }).format(date);
}
