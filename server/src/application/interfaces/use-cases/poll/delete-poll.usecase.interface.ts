import { PollResponseDto } from "../../../dtos/poll/response/poll.response.dto";

export interface IDeletePollUseCase {
    execute(pollId: string, userId: string): Promise<PollResponseDto>;
}
