import { Poll } from "../../../../domain/entities/poll.entity";

export interface IGetChannelPollsUseCase {
    execute(channelId: string): Promise<Poll[]>;
}
