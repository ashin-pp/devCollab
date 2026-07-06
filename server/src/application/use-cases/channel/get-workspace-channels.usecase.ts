import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";

import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { ChannelResponseDto } from "../../dtos/channel/response/channel.response.dto";


@injectable()
export class GetWorkspaceChannelsUseCase implements IBaseUseCase<{workspaceId: string, userId: string}, ChannelResponseDto[]> {
    constructor(
        @inject(TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(payload: {workspaceId: string, userId: string}): Promise<ChannelResponseDto[]> {
        const { workspaceId, userId } = payload;
        const allChannels = await this._channelRepository.findByWorkspaceId(workspaceId);
        const userMemberships = await this._channelMemberRepository.findByUserId(userId);
        
        const approvedChannelIds = userMemberships.filter(m => m.status === ChannelMemberStatus.APPROVED).map(m => m.channelId);
        const pendingChannelIds = userMemberships.filter(m => m.status === ChannelMemberStatus.PENDING).map(m => m.channelId);

        // Visible channels: All channels are visible in this new design.
        const visibleChannels = allChannels;

        return visibleChannels.map(channel => ({
            id: channel.id as string,
            workspaceId: channel.workspaceId,
            name: channel.name,
            description: channel.description,
            privacy: channel.privacy,
            createdBy: channel.createdBy,
            isActive: channel.isActive,
            createdAt: channel.createdAt as Date,
            updatedAt: channel.updatedAt as Date,
            isMember: approvedChannelIds.includes(channel.id as string),
            hasPendingRequest: pendingChannelIds.includes(channel.id as string)
        }));
    }
}
