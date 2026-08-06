import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import { Message } from "../../../domain/entities/message.entity";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { SubscriptionStatus } from "../../../domain/enums/SubscriptionStatus";
import { AppError } from "../../../domain/errors/AppError";
import { IGetChannelMessagesUseCase } from "../../interfaces/use-cases/channel/get-channel-messages.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class GetChannelMessagesUseCase implements IGetChannelMessagesUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IMessageRepository) private _messageRepository: IMessageRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService
    ) {}

    async execute(payload: {
        channelId: string;
        page?: number;
        limit?: number;
        viewerId: string;
    }): Promise<Message[]> {
        const { channelId, page = 1, limit = 50, viewerId } = payload;

        await this._planEntitlementService.resolveForUserId(viewerId);

        const member = await this._channelMemberRepository.findByChannelAndUser(channelId, viewerId);
        if (!member || member.status !== ChannelMemberStatus.APPROVED) {
            // Channel remains listed, but history is hidden after leave/remove
            return [];
        }

        const channel = await this._channelRepository.findById(channelId);
        if (!channel) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const workspace = await this._workspaceRepository.findById(channel.workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const viewerEntitlement = await this._planEntitlementService.resolveForUserId(viewerId);
        const ownerEntitlement = await this._planEntitlementService.resolveForUserId(workspace.createdBy);

        const sinceCandidates: Date[] = [];
        const retentionDays = ownerEntitlement.plan.messageRetentionDays;
        if (retentionDays > 0) {
            const retentionStart = new Date();
            retentionStart.setDate(retentionStart.getDate() - retentionDays);
            sinceCandidates.push(retentionStart);
        }

        // Starter: after rejoin, only messages from the new join time onward
        if (
            viewerEntitlement.subscriptionStatus === SubscriptionStatus.STARTER &&
            member.joinedAt
        ) {
            sinceCandidates.push(member.joinedAt);
        }

        const since = sinceCandidates.length
            ? new Date(Math.max(...sinceCandidates.map((d) => d.getTime())))
            : undefined;

        const skip = (page - 1) * limit;
        const messages = await this._messageRepository.findByChannelId(channelId, limit, skip, since);

        const rootIds = messages
            .map(m => m.id)
            .filter((id): id is string => Boolean(id));

        const replyCounts = await this._messageRepository.countVisibleRepliesByRootIds(rootIds, viewerId, since);

        for (const message of messages) {
            if (message.id) {
                message.replyCount = replyCounts[message.id] || 0;
            }
        }

        return messages;
    }
}
