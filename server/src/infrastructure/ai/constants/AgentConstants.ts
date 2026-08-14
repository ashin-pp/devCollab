export const AGENT_NAMES = [
    "NotifyAgent",
    "SummaryAgent",
    "RemindAgent",
    "TaskAgent",
    "ScheduleAgent",
] as const;

export type AgentName = typeof AGENT_NAMES[number];
export type RouteDestination = AgentName | "FINISH";
