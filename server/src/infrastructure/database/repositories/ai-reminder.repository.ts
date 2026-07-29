import { injectable } from 'tsyringe';
import { IAIReminderRepository } from "../../../application/interfaces/repositories/ai-reminder.repository.interface";
import { AIReminder } from "../../../domain/entities/ai-reminder.entity";
import { AIReminderModel } from "../models/ai-reminder.model";

import { AIReminderMapper } from "../mappers/ai-reminder.mapper";

@injectable()
export class AIReminderRepository implements IAIReminderRepository {
    private _mapper: AIReminderMapper;

    constructor() {
        this._mapper = new AIReminderMapper();
    }

    async create(reminder: Partial<AIReminder>): Promise<AIReminder> {
        const createdReminder = new AIReminderModel({
            user_id: reminder.userId,
            workspace_id: reminder.workspaceId,
            channel_id: reminder.channelId,
            agent_id: reminder.agentId,
            message_id: reminder.messageId,
            content: reminder.content,
            remind_at: reminder.remindAt,
            is_sent: reminder.isSent
        });
        const savedReminder = await createdReminder.save();
        return this._mapper.toDomain(savedReminder);
    }

    async findByUser(userId: string): Promise<AIReminder[]> {
        const reminders = await AIReminderModel.find({ user_id: userId, is_sent: false });
        return reminders.map(r => this._mapper.toDomain(r));
    }

    async findByWorkspace(workspaceId: string): Promise<AIReminder[]> {
        const reminders = await AIReminderModel.find({ workspace_id: workspaceId });
        return reminders.map(r => this._mapper.toDomain(r));
    }

    async markAsSent(id: string): Promise<AIReminder | null> {
        const updated = await AIReminderModel.findByIdAndUpdate(id, { is_sent: true }, { new: true });
        return updated ? this._mapper.toDomain(updated) : null;
    }
}
