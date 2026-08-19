import { PollResponseDto } from "../../../dtos/poll/response/poll.response.dto";

export interface ICreatePollUseCase {
    execute(data: {
        workspaceId: string;
        question: string;
        options: string[];
        createdBy: string;
        channelId?: string;
        expiresAt?: Date;
        startsAt?: Date;
    }): Promise<PollResponseDto>;
}
