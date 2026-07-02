import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";

export class GetBlockedChannelMembersUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(workspaceId: string, channelId: string, requestUserId: string) {
        if (!workspaceId || !channelId) {
            throw new AppError(ErrorMessage.INVALID_CHANNEL_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const isCreator = channel.createdBy === requestUserId || (channel as any).created_by?.toString() === requestUserId;
        if (!isCreator) {
            return [];
        }

        const blockedMembers = await this.channelMemberRepository.findByChannelId(channelId, ChannelMemberStatus.BLOCKED);

        const blockedMembersWithDetails = await Promise.all(
            blockedMembers.map(async (member) => {
                const user = await this.userRepository.findById(member.userId);
                return {
                    id: member.id,
                    channelId: member.channelId,
                    userId: member.userId,
                    role: member.role,
                    joinedAt: member.joinedAt,
                    user: user ? {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        profileImage: user.profileImage
                    } : null
                };
            })
        );

        return blockedMembersWithDetails;
    }
}
