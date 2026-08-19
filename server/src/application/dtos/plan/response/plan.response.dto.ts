export interface PlanResponseDto {
    id: string;
    name: string; 
    price: number;
    currency: string;
    durationDays: number;
    maxWorkspaces: number;
    maxMembersPerWorkspace: number;
    messageRetentionDays: number;
    aiAssistantEnabled: boolean;
    videoCallsEnabled: boolean;
    multiAiAgents: boolean;
    pinBoardEnabled: boolean;
    isActive: boolean;
}