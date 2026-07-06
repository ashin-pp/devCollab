import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class GetUnreadCountsUseCase implements IBaseUseCase<{workspaceId: string, userId: string}, { success: boolean; data: Record<string, number>; statusCode: number }> {
    constructor(
        @inject(TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(TOKENS.IMessageRepository) private _messageRepository: IMessageRepository
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
