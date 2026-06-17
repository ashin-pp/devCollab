import { IChannelMemberRepository } from "../../../domain/repositories/IChannelMemberRepository";
import { IChannelRepository } from "../../../domain/repositories/IChannelRepository";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class RemoveChannelMemberUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(workspaceId: string, channelId: string, targetUserId: string, requestUserId: string) {
        if (!workspaceId || !channelId || !targetUserId) {
            throw new AppError("Invalid parameters", HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError("Channel not found", HttpStatusCode.NOT_FOUND);
        }

        // Only the channel creator or a workspace admin should be able to remove members
        // For simplicity, we check if requestUserId is the creator of the channel.
        // Wait, what if the user is leaving themselves? That should be handled by LeaveChannelUseCase.
        // So this is strictly for removing OTHERS.
        if (channel.createdBy !== requestUserId) {
            throw new AppError("Only the channel creator can remove members", HttpStatusCode.FORBIDDEN);
        }

        if (targetUserId === channel.createdBy) {
            throw new AppError("Creator cannot be removed from the channel", HttpStatusCode.BAD_REQUEST);
        }

        const success = await this.channelMemberRepository.remove(channelId, targetUserId);
        if (!success) {
            throw new AppError("Member not found in channel", HttpStatusCode.NOT_FOUND);
        }

        return true;
    }
}
