import { IChannelRepository } from "../../../domain/repositories/IChannelRepository";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class UpdateChannelUseCase {
    constructor(private channelRepository: IChannelRepository) { }

    async execute(workspaceId: string, channelId: string, requestUserId: string, updateData: { name?: string, description?: string, privacy?: 'public' | 'private' }) {
        if (!workspaceId || !channelId) {
            throw new AppError("Invalid parameters", HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError("Channel not found", HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy !== requestUserId) {
            throw new AppError("Only the channel creator can update settings", HttpStatusCode.FORBIDDEN);
        }

        if (updateData.name?.trim() === '') {
            throw new AppError("Channel name cannot be empty", HttpStatusCode.BAD_REQUEST);
        }

        const updated = await this.channelRepository.update(channelId, updateData);
        if (!updated) {
            throw new AppError("Failed to update channel", HttpStatusCode.INTERNAL_SERVER);
        }

        return updated;
    }
}
