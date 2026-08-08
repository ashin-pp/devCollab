import { PollResponseDto } from "../../../dtos/poll/response/poll.response.dto";

export interface IVotePollUseCase {
    execute(pollId: string, userId: string, optionId: string): Promise<PollResponseDto>;
}
