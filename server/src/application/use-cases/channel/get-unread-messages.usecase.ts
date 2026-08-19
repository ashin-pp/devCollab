import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import { Message } from "../../../domain/entities/message.entity";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { SubscriptionStatus } from "../../../domain/enums/SubscriptionStatus";
import { IGetUnreadMessagesUseCase } from "../../interfaces/use-cases/channel/get-unread-messages.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class GetUnreadMessagesUseCase implements IGetUnreadMessagesUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IMessageRepository) private _messageRepository: IMessageRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService
    ) {}

    async execute(payload: {channelId: string, userId: string}): Promise<Message[]> {
        const { channelId, userId } = payload;

        await this._planEntitlementService.resolveForUserId(userId);

        const member = await this._channelMemberRepository.findByChannelAndUser(channelId, userId);
        
        if (!member || member.status !== ChannelMemberStatus.APPROVED) {
            return [];
        }

        const dateToCompare = member.lastReadAt || member.joinedAt || new Date(0);

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

        const viewerEntitlement = await this._planEntitlementService.resolveForUserId(userId);
        if (
            viewerEntitlement.subscriptionStatus === SubscriptionStatus.STARTER &&
            member.joinedAt
        ) {
            sinceCandidates.push(member.joinedAt);
        }

        const since = sinceCandidates.length
            ? new Date(Math.max(...sinceCandidates.map((d) => d.getTime())))
            : undefined;

        return await this._messageRepository.findUnreadMessages(channelId, dateToCompare, since);
    }
}
