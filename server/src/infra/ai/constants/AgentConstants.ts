export const AGENT_NAMES = [
    "TaskAgent", 
    "NotifyAgent", 
    "SummaryAgent", 
    "RemindAgent", 
    "FixAgent"
] as const;

export type AgentName = typeof AGENT_NAMES[number];
export type RouteDestination = AgentName | "FINISH";
