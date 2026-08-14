import { AISchedule } from "../../../domain/entities/ai-schedule.entity";
import type { IAIScheduleModel } from "../models/ai-schedule.model";

export class AIScheduleMapper {
    toDomain(persistence: IAIScheduleModel): AISchedule {
        const participantIds = (persistence.participant_ids ?? []).map((id) => id.toString());
        const rawProvider = persistence.video_provider as string | undefined;
        const videoProvider = rawProvider === "none" || !rawProvider ? "none" : "webrtc";

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
            persistence.reminder_sent,
            participantIds,
            videoProvider,
            persistence.room_name,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at,
            persistence.updated_at
        );
    }
}
