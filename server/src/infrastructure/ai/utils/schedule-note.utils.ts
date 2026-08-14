export const normalizeScheduleName = (raw: string) => raw.replace(/^@/, "").trim();

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HTML_TAGS = /<[^>]*>/g;
const NBSP = /&nbsp;/gi;
const SCHEDULE_COMMAND = /^(?:@\S+\s+)*\/schedule\b/i;
const MENTION = /@\S+/g;
const CLOCK_12H = /\b\d{1,2}([:.]\d{2})?\s*(a\.?m\.?|p\.?m\.?)\b/gi;
const CLOCK_24H = /\b([01]?\d|2[0-3])[:.]\d{2}\b/g;
const RELATIVE_DAY =
    /\b(today|tomorrow|tonight|yesterday|this\s+(morning|afternoon|evening|night|week))\b/gi;
const WEEKDAY =
    /\b(this|next)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi;
const IN_DURATION = /\b(in)\s+\d+\s+(min|mins|minutes|hr|hrs|hours|day|days)\b/gi;
const BARE_DURATION = /\b\d+\s+(min|mins|minutes|hr|hrs|hours)\b/gi;
const SCHEDULE_VERBS = /\b(please\s+)?(schedule|scheduled|book|set\s+up|setup|create)\b/gi;
const MEETING_NOUN = /\b(a|an|the)\s+(quick\s+)?(video\s+)?(call|meeting|meet)\b/gi;
const CALL_WORDS = /\b(video\s+call|meeting|call|meet)\b/gi;
const LINK_WORDS = /\b(with|at|on|from)\b/gi;
const QUOTES = /[“”"']/g;
const EXTRA_SPACES = /\s+/g;
const EDGE_PUNCT = /^[,\-–—:]+|[,\-–—:]+$/g;

export const extractScheduleNote = (raw: string, inviteeNames: string[]): string => {
    let text = String(raw || "").replace(HTML_TAGS, " ").replace(NBSP, " ").trim();
    text = text.replace(SCHEDULE_COMMAND, " ");

    for (const name of inviteeNames) {
        if (!name) continue;
        text = text.replace(new RegExp(`@?${escapeRegExp(name)}`, "gi"), " ");
    }

    return text
        .replace(MENTION, " ")
        .replace(CLOCK_12H, " ")
        .replace(CLOCK_24H, " ")
        .replace(RELATIVE_DAY, " ")
        .replace(WEEKDAY, " ")
        .replace(IN_DURATION, " ")
        .replace(BARE_DURATION, " ")
        .replace(SCHEDULE_VERBS, " ")
        .replace(MEETING_NOUN, " ")
        .replace(CALL_WORDS, " ")
        .replace(LINK_WORDS, " ")
        .replace(QUOTES, " ")
        .replace(EXTRA_SPACES, " ")
        .trim()
        .replace(EDGE_PUNCT, "")
        .trim();
};
