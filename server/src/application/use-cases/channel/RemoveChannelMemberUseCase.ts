import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class RemoveChannelMemberUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(workspaceId: string, channelId: string, targetUserId: string, requestUserId: string) {
        if (!workspaceId || !channelId || !targetUserId) {
            throw new AppError(ErrorMessage.INVALID_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy !== requestUserId) {
            throw new AppError(ErrorMessage.CHANNEL_CREATOR_ONLY, HttpStatusCode.FORBIDDEN);
        }

        if (targetUserId === channel.createdBy) {
            throw new AppError(ErrorMessage.CHANNEL_CREATOR_CANNOT_BE_REMOVED, HttpStatusCode.BAD_REQUEST);
        }

        const success = await this.channelMemberRepository.remove(channelId, targetUserId);
        if (!success) {
            throw new AppError(ErrorMessage.CHANNEL_MEMBER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        return true;
    }
}
