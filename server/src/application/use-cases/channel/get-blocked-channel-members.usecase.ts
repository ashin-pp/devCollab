import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { ChannelMemberResponseDto } from "../../dtos/channel/response/channel-member.response.dto";
import { ChannelMemberRole } from "../../../domain/enums/ChannelMemberStatus";

@injectable()
export class GetBlockedChannelMembersUseCase implements IBaseUseCase<{ workspaceId: string, channelId: string, requestUserId: string }, ChannelMemberResponseDto[]> {
    constructor(
        @inject(TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) { }

    async execute(payload: { workspaceId: string, channelId: string, requestUserId: string }): Promise<ChannelMemberResponseDto[]> {
        const { workspaceId, channelId, requestUserId } = payload;
        if (!workspaceId || !channelId) {
            throw new AppError(ErrorMessage.INVALID_CHANNEL_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this._channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const isCreator = channel.createdBy === requestUserId;
        if (!isCreator) {
            return [];
        }

        const blockedMembers = await this._channelMemberRepository.findByChannelId(channelId, ChannelMemberStatus.BLOCKED);

        const blockedMembersWithDetails = await Promise.all(
            blockedMembers.map(async (member) => {
                const user = await this._userRepository.findById(member.userId);
                return {
                    id: member.id as string,
                    channelId: member.channelId,
                    userId: member.userId,
                    role: member.role as unknown as ChannelMemberRole,
                    status: member.status as unknown as ChannelMemberStatus,
                    joinedAt: member.joinedAt as Date,
                    user: user ? {
                        id: user.id as string,
                        name: user.name,
                        email: user.email,
                        profileImage: user.profileImage,
                        skills: user.skills || []
                    } : undefined
                };
            })
        );

        return blockedMembersWithDetails;
    }
}
