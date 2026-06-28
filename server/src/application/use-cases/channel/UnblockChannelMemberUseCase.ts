import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class UnblockChannelMemberUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(workspaceId: string, channelId: string, memberId: string, requesterId: string): Promise<void> {
        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.privacy !== 'public') {
            throw new AppError("Blocking/Unblocking members is only supported in public channels.", HttpStatusCode.BAD_REQUEST);
        }

        const isCreator = channel.createdBy === requesterId || (channel as any).created_by?.toString() === requesterId;
        if (!isCreator) {
            throw new AppError("Only the channel creator can unblock members.", HttpStatusCode.FORBIDDEN);
        }

        const targetMember = await this.channelMemberRepository.findByChannelAndUser(channelId, memberId);
        
        if (targetMember) {
            // Unblocking effectively removes the user completely from the channel records
            // so they can organically join again.
            await this.channelMemberRepository.remove(channelId, memberId);
        } else {
            throw new AppError("User is not a member of this channel.", HttpStatusCode.NOT_FOUND);
        }
    }
}
