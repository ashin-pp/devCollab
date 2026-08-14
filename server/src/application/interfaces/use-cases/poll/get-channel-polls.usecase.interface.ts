import { PollResponseDto } from "../../../dtos/poll/response/poll.response.dto";

export interface IGetChannelPollsUseCase {
    execute(channelId: string): Promise<PollResponseDto[]>;
}
