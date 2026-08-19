import { MessageResponseDto } from "../../../dtos/channel/response/message.response.dto";

export interface IGetChannelMessagesUseCase {
    execute(payload: {
        channelId: string;
        page?: number;
        limit?: number;
        viewerId: string;
    }): Promise<MessageResponseDto[]>;
}
