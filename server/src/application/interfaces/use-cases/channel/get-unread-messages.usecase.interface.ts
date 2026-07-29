import { Message } from "../../../../domain/entities/message.entity";

export interface IGetUnreadMessagesUseCase {
    execute(payload: {channelId: string, userId: string}): Promise<Message[]>;
}
