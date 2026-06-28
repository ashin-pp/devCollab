import { IMessageRepository } from "../../../application/repositories/IMessageRepository";
import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { Message } from "../../../domain/entities/Message";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class SendMessageUseCase {
    constructor(
        private messageRepository: IMessageRepository,
        private channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(
        workspaceId: string, 
        channelId: string, 
        senderId: string, 
        content: string,
        messageType: 'text' | 'image' | 'system' = 'text',
        imageUrl?: string
    ): Promise<Message> {
        const member = await this.channelMemberRepository.findByChannelAndUser(channelId, senderId);
        
        if (!member) {
            throw new AppError("You are not a member of this channel.", HttpStatusCode.FORBIDDEN);
        }

        if (member.status === 'blocked') {
            throw new AppError("You have been blocked from sending messages in this channel.", HttpStatusCode.FORBIDDEN);
        }

        if (member.status !== 'approved') {
            throw new AppError("You do not have permission to send messages in this channel.", HttpStatusCode.FORBIDDEN);
        }

        const newMessage = new Message(
            workspaceId,
            channelId,
            senderId,
            content,
            messageType,
            undefined, // senderName
            imageUrl
        );

        return await this.messageRepository.create(newMessage);
    }
}
