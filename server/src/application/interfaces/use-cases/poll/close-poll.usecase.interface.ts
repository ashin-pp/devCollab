import { PollResponseDto } from "../../../dtos/poll/response/poll.response.dto";

export interface IClosePollUseCase {
    execute(pollId: string, userId: string): Promise<PollResponseDto>;
}
