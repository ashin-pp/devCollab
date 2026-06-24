import { IMessageRepository } from "../../../application/repositories/IMessageRepository";
import { Message } from "../../../domain/entities/Message";

export class SendMessageUseCase {
    constructor(private messageRepository: IMessageRepository) {}

    async execute(workspaceId: string, channelId: string, senderId: string, content: string): Promise<Message> {
        const newMessage = new Message(
            workspaceId,
            channelId,
            senderId,
            content,
            'text'
        );

        return await this.messageRepository.create(newMessage);
    }
}
