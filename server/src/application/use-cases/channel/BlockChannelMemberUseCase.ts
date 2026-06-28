import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";

export class BlockChannelMemberUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(workspaceId: string, channelId: string, memberId: string, requesterId: string): Promise<{ userId: string, userName: string, removedBy: string }> {
        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.privacy !== 'public') {
            throw new AppError("Blocking members is only supported in public channels.", HttpStatusCode.BAD_REQUEST);
        }

        const isCreator = channel.createdBy === requesterId || (channel as any).created_by?.toString() === requesterId;
        if (!isCreator) {
            throw new AppError("Only the channel creator can block members.", HttpStatusCode.FORBIDDEN);
        }

        if (memberId === requesterId) {
            throw new AppError("You cannot block yourself from the channel.", HttpStatusCode.BAD_REQUEST);
        }

        const targetMember = await this.channelMemberRepository.findByChannelAndUser(channelId, memberId);
        
        if (targetMember) {
            await this.channelMemberRepository.updateStatus(channelId, memberId, ChannelMemberStatus.BLOCKED);
            
            const [targetUser, requestUser] = await Promise.all([
                this.userRepository.findById(memberId),
                this.userRepository.findById(requesterId)
            ]);

            return {
                userId: memberId,
                userName: targetUser?.name || 'Unknown User',
                removedBy: requestUser?.name || 'Admin'
            };
        } else {
            throw new AppError("User is not a member of this channel.", HttpStatusCode.NOT_FOUND);
        }
    }
}
