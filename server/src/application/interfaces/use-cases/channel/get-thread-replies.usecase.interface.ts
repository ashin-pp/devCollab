import { ThreadRepliesResponseDto } from "../../../dtos/channel/response/message.response.dto";

export interface IGetThreadRepliesUseCase {
    execute(payload: {
        threadRootId: string;
        channelId: string;
        viewerId: string;
    }): Promise<ThreadRepliesResponseDto>;
}
