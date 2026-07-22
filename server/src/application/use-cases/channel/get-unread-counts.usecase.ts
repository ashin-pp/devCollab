import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { IGetUnreadCountsUseCase } from "../../interfaces/use-cases/channel/get-unread-counts.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetUnreadCountsUseCase implements IGetUnreadCountsUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IMessageRepository) private _messageRepository: IMessageRepository
    ) {}

    async execute(payload: {workspaceId: string, userId: string}): Promise<{ success: boolean; data: Record<string, number>; statusCode: number }> {
        const { workspaceId, userId } = payload;
        // Get all channels in workspace where user is a member
        const allChannels = await this._channelRepository.findByWorkspaceId(workspaceId);
        const userChannels = [];

        for (const channel of allChannels) {
            const membership = await this._channelMemberRepository.findByChannelIdAndUserId(channel.id as string, userId);
            if (membership && membership.status === ChannelMemberStatus.APPROVED) {
                userChannels.push({ channel, membership });
            }
        }

        // Get unread count for each channel
        const unreadCounts: Record<string, number> = {};

        for (const { channel, membership } of userChannels) {
            const lastReadAt = membership.lastReadAt || membership.joinedAt || new Date(0);
            const count = await this._messageRepository.countUnreadMessages(channel.id as string, lastReadAt);
            unreadCounts[channel.id as string] = count;
        }

        return {
            success: true,
            data: unreadCounts,
            statusCode: HttpStatusCode.OK
        };
    }
}
