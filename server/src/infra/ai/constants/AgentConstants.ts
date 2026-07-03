export const AGENT_NAMES = [
    "NotifyAgent", 
    "SummaryAgent", 
    "RemindAgent"
] as const;

export type AgentName = typeof AGENT_NAMES[number];
export type RouteDestination = AgentName | "FINISH";
