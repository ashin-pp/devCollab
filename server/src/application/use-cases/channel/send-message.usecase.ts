import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { Message } from "../../../domain/entities/message.entity";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { SendMessageRequestDto } from "../../dtos/channel/request/send-message-request.dto";
import { ISendMessageUseCase } from "../../interfaces/use-cases/channel/send-message.usecase.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IMessageRepository) private _messageRepository: IMessageRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(USECASE_TOKENS.ICreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase,
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository
    ) {}
    async execute(payload: SendMessageRequestDto): Promise<Message> {
        const { workspaceId, channelId, senderId, content, messageType = 'text', imageUrl, mentionedUserIds } = payload;
        const member = await this._channelMemberRepository.findByChannelAndUser(channelId, senderId);
        
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

        const savedMessage = await this._messageRepository.create(newMessage);

        // Send notifications to mentioned users
        if (mentionedUserIds && mentionedUserIds.length > 0) {
            const channel = await this._channelRepository.findById(channelId);
            const channelName = channel ? channel.name : 'a channel';
            
            const workspace = await this._workspaceRepository.findById(workspaceId);
            const workspaceName = workspace ? workspace.name : 'a workspace';
            
            for (const userId of mentionedUserIds) {
                if (userId !== senderId) {
                    await this._createNotificationUseCase.execute({
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
