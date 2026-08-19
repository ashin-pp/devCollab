import { MessageType } from "../../../../domain/enums/MessageType";
import { DirectMessageResponseDto } from "../../../dtos/dm/response/direct-message.response.dto";

export interface ISendDirectMessageUseCase {
    execute(
        conversationId: string,
        senderId: string,
        content: string,
        messageType: MessageType,
        imageUrl?: string
    ): Promise<DirectMessageResponseDto>;
}
