import { injectable } from "tsyringe";
import type { IAIScheduleRepository } from "../../../application/interfaces/repositories/ai-schedule.repository.interface";
import { AISchedule } from "../../../domain/entities/ai-schedule.entity";
import { AIScheduleMapper } from "../mappers/ai-schedule.mapper";
import { AIScheduleModel } from "../models/ai-schedule.model";

@injectable()
export class AIScheduleRepository implements IAIScheduleRepository {
    private readonly _mapper = new AIScheduleMapper();

    async create(schedule: Partial<AISchedule>): Promise<AISchedule> {
        const created = new AIScheduleModel({
            organizer_id: schedule.organizerId,
            participant_id: schedule.participantId,
            workspace_id: schedule.workspaceId,
            channel_id: schedule.channelId,
            title: schedule.title,
            starts_at: schedule.startsAt,
            ends_at: schedule.endsAt,
            status: schedule.status || "scheduled",
            meet_link: schedule.meetLink,
            google_event_id: schedule.googleEventId,
            reminder_sent: schedule.reminderSent ?? false,
        });
        const saved = await created.save();
        return this._mapper.toDomain(saved);
    }

    async findById(id: string): Promise<AISchedule | null> {
        const doc = await AIScheduleModel.findById(id);
        return doc ? this._mapper.toDomain(doc) : null;
    }

    async findForUserInWorkspace(userId: string, workspaceId: string): Promise<AISchedule[]> {
        const docs = await AIScheduleModel.find({
            workspace_id: workspaceId,
            status: "scheduled",
            $or: [{ organizer_id: userId }, { participant_id: userId }],
        }).sort({ created_at: -1 });
        return docs.map((d) => this._mapper.toDomain(d));
    }

    async update(id: string, updateData: Partial<AISchedule>): Promise<AISchedule | null> {
        const updateDoc: Record<string, unknown> = {};
        if (updateData.meetLink !== undefined) updateDoc.meet_link = updateData.meetLink;
        if (updateData.googleEventId !== undefined) updateDoc.google_event_id = updateData.googleEventId;
        if (updateData.status !== undefined) updateDoc.status = updateData.status;
        if (updateData.reminderSent !== undefined) updateDoc.reminder_sent = updateData.reminderSent;
        if (updateData.title !== undefined) updateDoc.title = updateData.title;
        if (updateData.startsAt !== undefined) updateDoc.starts_at = updateData.startsAt;
        if (updateData.endsAt !== undefined) updateDoc.ends_at = updateData.endsAt;

        const updated = await AIScheduleModel.findByIdAndUpdate(id, updateDoc, { new: true });
        return updated ? this._mapper.toDomain(updated) : null;
    }

    async markReminderSent(id: string): Promise<AISchedule | null> {
        return this.update(id, { reminderSent: true });
    }

    async clearPastForUserInWorkspace(userId: string, workspaceId: string): Promise<number> {
        const result = await AIScheduleModel.deleteMany({
            workspace_id: workspaceId,
            $or: [{ organizer_id: userId }, { participant_id: userId }],
            ends_at: { $lt: new Date() },
        });
        return result.deletedCount ?? 0;
    }
}
