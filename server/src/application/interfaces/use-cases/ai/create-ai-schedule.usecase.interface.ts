import type { AISchedule } from "../../../../domain/entities/ai-schedule.entity";

export interface CreateAIScheduleDTO {
    organizerId: string;
    participantId: string;
    participantIds?: string[];
    workspaceId: string;
    channelId: string;
    title: string;
    note?: string;
    startsAt: string;
    endsAt: string;
    silent?: boolean;
}

export interface CreateAIScheduleResult {
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    meetLink?: string;
    videoProvider?: string;
    roomName?: string;
    reminderAt: string;
    schedule: AISchedule;
}

export interface ICreateAIScheduleUseCase {
    execute(dto: CreateAIScheduleDTO): Promise<CreateAIScheduleResult>;
}
