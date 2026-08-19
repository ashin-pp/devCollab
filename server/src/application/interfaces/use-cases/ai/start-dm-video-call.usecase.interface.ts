import type { DirectMessageResponseDto } from "../../../dtos/dm/response/direct-message.response.dto";

export interface StartDmVideoCallDTO {
    userId: string;
    workspaceId: string;
    conversationId: string;
}

export interface StartDmVideoCallResult {
    scheduleId: string;
    meetLink: string;
    title: string;
    participantId: string;
    message: DirectMessageResponseDto;
}

export interface IStartDmVideoCallUseCase {
    execute(dto: StartDmVideoCallDTO): Promise<StartDmVideoCallResult>;
}
