import { Message } from "../../../../domain/entities/message.entity";

export interface IGetChannelMessagesUseCase {
    execute(payload: {channelId: string, page?: number, limit?: number}): Promise<Message[]>;
}
