export type AIDashboardClearTab = "tasks" | "reminders" | "notifications" | "schedule";

export interface ClearAIDashboardTabDTO {
    userId: string;
    workspaceId: string;
    tab: AIDashboardClearTab;
}

export interface ClearAIDashboardTabResult {
    tab: AIDashboardClearTab;
    cleared: number;
}

export interface IClearAIDashboardTabUseCase {
    execute(dto: ClearAIDashboardTabDTO): Promise<ClearAIDashboardTabResult>;
}
