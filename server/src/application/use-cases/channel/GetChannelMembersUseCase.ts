import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class GetChannelMembersUseCase {
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

        const memberCheck = await this.channelMemberRepository.findByChannelAndUser(channelId, requestUserId);
        if (!memberCheck) {
            throw new AppError(ErrorMessage.CANNOT_VIEW_CHANNEL_MEMBERS, HttpStatusCode.FORBIDDEN);
        }

        const members = await this.channelMemberRepository.findByChannelId(channelId);

        const membersWithDetails = await Promise.all(
            members.map(async (member) => {
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

        return membersWithDetails;
    }
}
