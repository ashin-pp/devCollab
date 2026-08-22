import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import { Message } from "../../../domain/entities/message.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { NotificationTitle } from "../../../domain/enums/NotificationMessage";
import { ReplyVisibility } from "../../../domain/enums/ReplyVisibility";
import { AppError } from "../../../domain/errors/AppError";
import { SendMessageRequestDto } from "../../dtos/channel/request/send-message-request.dto";
import { MessageResponseDto } from "../../dtos/channel/response/message.response.dto";
import { ISendMessageUseCase } from "../../interfaces/use-cases/channel/send-message.usecase.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import { toMessageResponseDto } from "../../mappers/message.mapper";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IMessageRepository) private _messageRepository: IMessageRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(USECASE_TOKENS.ICreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase,
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService
    ) {}

    async execute(payload: SendMessageRequestDto): Promise<MessageResponseDto> {
        const {
            workspaceId,
            channelId,
            senderId,
            content,
            messageType = 'text',
            imageUrl,
            mentionedUserIds,
            parentMessageId,
            replyVisibility
        } = payload;

        await this._planEntitlementService.resolveForUserId(senderId);

        const member = await this._channelMemberRepository.findByChannelAndUser(channelId, senderId);
        
        if (!member) {
            throw new AppError(ErrorMessage.NOT_CHANNEL_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        if (member.status === 'blocked') {
            throw new AppError(ErrorMessage.CHANNEL_SEND_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        if (member.status !== 'approved') {
            throw new AppError(ErrorMessage.CHANNEL_SEND_FORBIDDEN, HttpStatusCode.FORBIDDEN);
        }

        let resolvedParentMessageId: string | undefined;
        let threadRootId: string | undefined;
        let resolvedVisibility = replyVisibility;
        let visibleToUserId: string | undefined;

        if (parentMessageId) {
            const parentMessage = await this._messageRepository.findById(parentMessageId);
            if (!parentMessage || parentMessage.channelId !== channelId) {
                throw new AppError(ErrorMessage.PARENT_MESSAGE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            // Flat threads: always attach replies to the root message
            threadRootId = parentMessage.threadRootId || parentMessage.id;
            resolvedParentMessageId = threadRootId;

            const rootMessage = parentMessage.threadRootId
                ? await this._messageRepository.findById(parentMessage.threadRootId)
                : parentMessage;

            if (!rootMessage) {
                throw new AppError(ErrorMessage.PARENT_MESSAGE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const visibility = replyVisibility || ReplyVisibility.EVERYONE;

            resolvedVisibility = visibility;
            if (visibility === ReplyVisibility.AUTHOR) {
                visibleToUserId = rootMessage.senderId;
            }
        }

        const newMessage = new Message(
            workspaceId,
            channelId,
            senderId,
            content,
            messageType,
            undefined,
            imageUrl?.split("?")[0],
            resolvedParentMessageId,
            threadRootId,
            resolvedVisibility,
            visibleToUserId
        );

        const savedMessage = await this._messageRepository.create(newMessage);

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
                        title: NotificationTitle.YOU_WERE_MENTIONED,
                        message: `Someone mentioned you in ${channelName} in ${workspaceName}`,
                        relatedId: channelId
                    }).catch(err => console.error("Failed to send mention notification:", err));
                }
            }
        }

        return toMessageResponseDto(savedMessage);
    }
}
