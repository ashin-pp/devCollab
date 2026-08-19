import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { SubscriptionStatus } from "../../../domain/enums/SubscriptionStatus";
import { IGetUnreadCountsUseCase } from "../../interfaces/use-cases/channel/get-unread-counts.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class GetUnreadCountsUseCase implements IGetUnreadCountsUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IMessageRepository) private _messageRepository: IMessageRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService
    ) {}

    async execute(payload: {workspaceId: string, userId: string}): Promise<{ success: boolean; data: Record<string, number>; statusCode: number }> {
        const { workspaceId, userId } = payload;
        const allChannels = await this._channelRepository.findByWorkspaceId(workspaceId);
        const userChannels = [];

        for (const channel of allChannels) {
            const membership = await this._channelMemberRepository.findByChannelIdAndUserId(channel.id as string, userId);
            if (membership && membership.status === ChannelMemberStatus.APPROVED) {
                userChannels.push({ channel, membership });
            }
        }

        const sinceCandidates: Date[] = [];
        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (workspace) {
            const ownerEntitlement = await this._planEntitlementService.resolveForUserId(workspace.createdBy);
            const retentionDays = ownerEntitlement.plan.messageRetentionDays;
            if (retentionDays > 0) {
                const retentionStart = new Date();
                retentionStart.setDate(retentionStart.getDate() - retentionDays);
                sinceCandidates.push(retentionStart);
            }
        }

        const viewerEntitlement = await this._planEntitlementService.resolveForUserId(userId);
        const unreadCounts: Record<string, number> = {};

        for (const { channel, membership } of userChannels) {
            const channelSince = [...sinceCandidates];
            if (
                viewerEntitlement.subscriptionStatus === SubscriptionStatus.STARTER &&
                membership.joinedAt
            ) {
                channelSince.push(membership.joinedAt);
            }

            const since = channelSince.length
                ? new Date(Math.max(...channelSince.map((d) => d.getTime())))
                : undefined;

            const lastReadAt = membership.lastReadAt || membership.joinedAt || new Date(0);
            const count = await this._messageRepository.countUnreadMessages(
                channel.id as string,
                lastReadAt,
                since
            );
            unreadCounts[channel.id as string] = count;
        }

        return {
            success: true,
            data: unreadCounts,
            statusCode: HttpStatusCode.OK
        };
    }
}
