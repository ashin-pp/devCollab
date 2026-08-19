import { AISchedule } from "../../../domain/entities/ai-schedule.entity";

export interface IAIScheduleRepository {
    create(schedule: Partial<AISchedule>): Promise<AISchedule>;
    findById(id: string): Promise<AISchedule | null>;
    findForUserInWorkspace(userId: string, workspaceId: string): Promise<AISchedule[]>;
    update(id: string, updateData: Partial<AISchedule>): Promise<AISchedule | null>;
    markReminderSent(id: string): Promise<AISchedule | null>;
    clearPastForUserInWorkspace(userId: string, workspaceId: string): Promise<number>;
}
