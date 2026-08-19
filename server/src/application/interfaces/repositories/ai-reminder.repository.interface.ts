import { AIReminder } from "../../../domain/entities/ai-reminder.entity";

export interface IAIReminderRepository {
    create(reminder: Partial<AIReminder>): Promise<AIReminder>;
    findByUser(userId: string): Promise<AIReminder[]>;
    findByUserInWorkspace(userId: string, workspaceId: string): Promise<AIReminder[]>;
    findDueUnsent(userId: string, workspaceId: string): Promise<AIReminder[]>;
    findByWorkspace(workspaceId: string): Promise<AIReminder[]>;
    markAsSent(id: string): Promise<AIReminder | null>;
    clearForUserInWorkspace(userId: string, workspaceId: string): Promise<number>;
}
