import { IChannelMemberRepository } from "../../../domain/repositories/IChannelMemberRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IChannelRepository } from "../../../domain/repositories/IChannelRepository";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class GetChannelMembersUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(workspaceId: string, channelId: string, requestUserId: string) {
        if (!workspaceId || !channelId) {
            throw new AppError("Invalid workspace or channel ID", HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError("Channel not found", HttpStatusCode.NOT_FOUND);
        }

        // Verify the user is a member of the channel
        const memberCheck = await this.channelMemberRepository.findByChannelAndUser(channelId, requestUserId);
        if (!memberCheck) {
            throw new AppError("You do not have permission to view members of this channel", HttpStatusCode.FORBIDDEN);
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
