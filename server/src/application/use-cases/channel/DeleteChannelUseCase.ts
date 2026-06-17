import { IChannelRepository } from "../../../domain/repositories/IChannelRepository";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class DeleteChannelUseCase {
    constructor(private channelRepository: IChannelRepository) { }

    async execute(workspaceId: string, channelId: string, requestUserId: string) {
        if (!workspaceId || !channelId) {
            throw new AppError("Invalid parameters", HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError("Channel not found", HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy !== requestUserId) {
            throw new AppError("Only the channel creator can delete the channel", HttpStatusCode.FORBIDDEN);
        }

        // Wait, what if it's the "general" channel? We shouldn't allow deleting the default channel.
        if (channel.name === "general") {
            throw new AppError("The general channel cannot be deleted", HttpStatusCode.BAD_REQUEST);
        }

        const success = await this.channelRepository.delete(channelId);
        if (!success) {
            throw new AppError("Failed to delete channel", HttpStatusCode.INTERNAL_SERVER);
        }

        return true;
    }
}
