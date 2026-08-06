import type { AISchedule } from "../../../../domain/entities/ai-schedule.entity";

export interface CreateAIScheduleDTO {
    organizerId: string;
    participantId: string;
    workspaceId: string;
    channelId: string;
    title: string;
    startsAt: string;
    endsAt: string;
    meetLink?: string;
    googleEventId?: string;
}

export interface CreateAIScheduleResult {
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    meetLink?: string;
    reminderAt: string;
    schedule: AISchedule;
}

export interface ICreateAIScheduleUseCase {
    execute(dto: CreateAIScheduleDTO): Promise<CreateAIScheduleResult>;
}
