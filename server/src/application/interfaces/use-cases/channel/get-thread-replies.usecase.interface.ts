import { Message } from "../../../../domain/entities/message.entity";

export interface IGetThreadRepliesUseCase {
    execute(payload: {
        threadRootId: string;
        channelId: string;
        viewerId: string;
    }): Promise<{ rootMessage: Message; replies: Message[] }>;
}
