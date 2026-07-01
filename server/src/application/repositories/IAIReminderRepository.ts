import { AIReminder } from "../../domain/entities/AIReminder";

export interface IAIReminderRepository {
    create(reminder: Partial<AIReminder>): Promise<AIReminder>;
    findByUser(userId: string): Promise<AIReminder[]>;
    findByWorkspace(workspaceId: string): Promise<AIReminder[]>;
    markAsSent(id: string): Promise<AIReminder | null>;
}
