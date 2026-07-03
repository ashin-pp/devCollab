import { IMessageRepository } from "../../../application/repositories/IMessageRepository";
import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { IWorkspaceRepository } from "../../../application/repositories/IWorkspaceRepository";
import { Message } from "../../../domain/entities/Message";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { CreateNotificationUseCase } from "../notification/CreateNotificationUseCase";

export class SendMessageUseCase {
    constructor(
        private messageRepository: IMessageRepository,
        private channelMemberRepository: IChannelMemberRepository,
        private createNotificationUseCase: CreateNotificationUseCase,
        private channelRepository: IChannelRepository,
        private workspaceRepository: IWorkspaceRepository
    ) {}

    async execute(
        workspaceId: string, 
        channelId: string, 
        senderId: string, 
        content: string,
        messageType: 'text' | 'image' | 'system' = 'text',
        imageUrl?: string,
        mentionedUserIds?: string[]
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

        const savedMessage = await this.messageRepository.create(newMessage);

        // Send notifications to mentioned users
        if (mentionedUserIds && mentionedUserIds.length > 0) {
            const channel = await this.channelRepository.findById(channelId);
            const channelName = channel ? channel.name : 'a channel';
            
            const workspace = await this.workspaceRepository.findById(workspaceId);
            const workspaceName = workspace ? workspace.name : 'a workspace';
            
            for (const userId of mentionedUserIds) {
                if (userId !== senderId) {
                    await this.createNotificationUseCase.execute({
                        userId,
                        type: 'GENERAL',
                        title: 'You were mentioned',
                        message: `Someone mentioned you in ${channelName} in ${workspaceName}`,
                        relatedId: channelId
                    }).catch(err => console.error("Failed to send mention notification:", err));
                }
            }
        }

        return savedMessage;
    }
}
