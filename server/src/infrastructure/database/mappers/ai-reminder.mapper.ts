import { AIReminder } from "../../../domain/entities/ai-reminder.entity";
import { IMapper } from "../../../application/interfaces/IMapper";
import { IAIReminderModel } from "../models/ai-reminder.model";

export class AIReminderMapper implements IMapper<AIReminder, IAIReminderModel> {
    toDomain(persistence: IAIReminderModel): AIReminder {
        return new AIReminder(
            persistence.user_id.toString(),
            persistence.workspace_id.toString(),
            persistence.channel_id.toString(),
            persistence.agent_id ? persistence.agent_id.toString() : "000000000000000000000000",
            persistence.message_id ? persistence.message_id.toString() : "000000000000000000000000",
            persistence.content,
            persistence.remind_at,
            persistence.is_sent,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at
        );
    }

    toPersistence(domain: Partial<AIReminder>): Partial<IAIReminderModel> {
        const persistence: Partial<IAIReminderModel> = {
            user_id: domain.userId as any,
            workspace_id: domain.workspaceId as any,
            channel_id: domain.channelId as any,
            agent_id: domain.agentId as any,
            message_id: domain.messageId as any,
            content: domain.content,
            remind_at: domain.remindAt,
            is_sent: domain.isSent
        };

        return Object.fromEntries(
            Object.entries(persistence).filter(([_, value]) => value !== undefined)
        ) as Partial<IAIReminderModel>;
    }
}
