import { DirectMessage } from "../../../../domain/entities/direct-message.entity";
import { MessageType } from "../../../../domain/enums/MessageType";

export interface ISendDirectMessageUseCase {
    execute(conversationId: string, senderId: string, content: string, messageType: MessageType, imageUrl?: string): Promise<DirectMessage>;
}
