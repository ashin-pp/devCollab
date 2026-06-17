import { IChannelMemberRepository } from "../../../domain/repositories/IChannelMemberRepository";
import { IChannelRepository } from "../../../domain/repositories/IChannelRepository";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class LeaveChannelUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(workspaceId: string, channelId: string, requestUserId: string) {
        if (!workspaceId || !channelId) {
            throw new AppError("Invalid parameters", HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError("Channel not found", HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy === requestUserId) {
            throw new AppError("Channel creator cannot leave the channel. Delete the channel or transfer ownership (if supported).", HttpStatusCode.BAD_REQUEST);
        }

        const success = await this.channelMemberRepository.remove(channelId, requestUserId);
        if (!success) {
            throw new AppError("You are not a member of this channel", HttpStatusCode.NOT_FOUND);
        }

        return true;
    }
}
