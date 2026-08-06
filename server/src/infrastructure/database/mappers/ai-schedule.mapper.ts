import { AISchedule } from "../../../domain/entities/ai-schedule.entity";
import type { IAIScheduleModel } from "../models/ai-schedule.model";

export class AIScheduleMapper {
    toDomain(persistence: IAIScheduleModel): AISchedule {
        return new AISchedule(
            persistence.organizer_id.toString(),
            persistence.participant_id.toString(),
            persistence.workspace_id.toString(),
            persistence.channel_id.toString(),
            persistence.title,
            persistence.starts_at,
            persistence.ends_at,
            persistence.status,
            persistence.meet_link,
            persistence.google_event_id,
            persistence.reminder_sent,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at,
            persistence.updated_at
        );
    }
}
