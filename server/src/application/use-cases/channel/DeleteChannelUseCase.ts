import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class DeleteChannelUseCase {
    constructor(private channelRepository: IChannelRepository) { }

    async execute(workspaceId: string, channelId: string, requestUserId: string) {
        if (!workspaceId || !channelId) {
            throw new AppError(ErrorMessage.INVALID_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy !== requestUserId) {
            throw new AppError(ErrorMessage.CHANNEL_CREATOR_ONLY, HttpStatusCode.FORBIDDEN);
        }

        if (channel.name === "general") {
            throw new AppError(ErrorMessage.CANNOT_DELETE_GENERAL_CHANNEL, HttpStatusCode.BAD_REQUEST);
        }

        const success = await this.channelRepository.delete(channelId);
        if (!success) {
            throw new AppError(ErrorMessage.FAILED_TO_DELETE_CHANNEL, HttpStatusCode.INTERNAL_SERVER);
        }

        return true;
    }
}
