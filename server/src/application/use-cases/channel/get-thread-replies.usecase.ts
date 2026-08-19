import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { SubscriptionStatus } from "../../../domain/enums/SubscriptionStatus";
import { AppError } from "../../../domain/errors/AppError";
import { ThreadRepliesResponseDto } from "../../dtos/channel/response/message.response.dto";
import { IGetThreadRepliesUseCase } from "../../interfaces/use-cases/channel/get-thread-replies.usecase.interface";
import { toMessageResponseDto } from "../../mappers/message.mapper";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class GetThreadRepliesUseCase implements IGetThreadRepliesUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IMessageRepository) private _messageRepository: IMessageRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService
    ) {}

    async execute(payload: {
        threadRootId: string;
        channelId: string;
        viewerId: string;
    }): Promise<ThreadRepliesResponseDto> {
        const { threadRootId, channelId, viewerId } = payload;

        await this._planEntitlementService.resolveForUserId(viewerId);

        const member = await this._channelMemberRepository.findByChannelAndUser(channelId, viewerId);
        if (!member || member.status !== ChannelMemberStatus.APPROVED) {
            throw new AppError(ErrorMessage.NOT_CHANNEL_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        const rootMessage = await this._messageRepository.findById(threadRootId);
        if (!rootMessage || rootMessage.channelId !== channelId) {
            throw new AppError(ErrorMessage.PARENT_MESSAGE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (rootMessage.threadRootId) {
            throw new AppError(ErrorMessage.INVALID_THREAD_REPLY, HttpStatusCode.BAD_REQUEST);
        }

        const sinceCandidates: Date[] = [];
        const channel = await this._channelRepository.findById(channelId);
        if (channel) {
            const workspace = await this._workspaceRepository.findById(channel.workspaceId);
            if (workspace) {
                const ownerEntitlement = await this._planEntitlementService.resolveForUserId(workspace.createdBy);
                const retentionDays = ownerEntitlement.plan.messageRetentionDays;
                if (retentionDays > 0) {
                    const retentionStart = new Date();
                    retentionStart.setDate(retentionStart.getDate() - retentionDays);
                    sinceCandidates.push(retentionStart);
                }
            }
        }

        const viewerEntitlement = await this._planEntitlementService.resolveForUserId(viewerId);
        if (
            viewerEntitlement.subscriptionStatus === SubscriptionStatus.STARTER &&
            member.joinedAt
        ) {
            sinceCandidates.push(member.joinedAt);
        }

        const since = sinceCandidates.length
            ? new Date(Math.max(...sinceCandidates.map((d) => d.getTime())))
            : undefined;

        const replies = await this._messageRepository.findThreadReplies(threadRootId, viewerId, since);
        rootMessage.replyCount = replies.length;

        return {
            rootMessage: toMessageResponseDto(rootMessage),
            replies: replies.map(toMessageResponseDto),
        };
    }
}
