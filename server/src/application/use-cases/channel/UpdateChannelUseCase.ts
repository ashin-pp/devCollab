import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { IWorkspaceMemberRepository } from "../../../application/repositories/IWorkspaceMemberRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";

export class UpdateChannelUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) { }

    async execute(workspaceId: string, channelId: string, requestUserId: string, updateData: { name?: string, description?: string, privacy?: 'public' | 'private', is_active?: boolean }) {
        if (!workspaceId || !channelId) {
            throw new AppError(ErrorMessage.INVALID_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy !== requestUserId) {
            const workspaceMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requestUserId);
            const isWorkspaceOwner = workspaceMember?.role === MemberRole.OWNER;

            if (!isWorkspaceOwner) {
                throw new AppError(ErrorMessage.CHANNEL_CREATOR_ONLY, HttpStatusCode.FORBIDDEN);
            }
        }

        if (updateData.name?.trim() === '') {
            throw new AppError(ErrorMessage.CHANNEL_NAME_EMPTY, HttpStatusCode.BAD_REQUEST);
        }

        if (updateData.name) {
            channel.name = updateData.name;
        }

        if (updateData.description !== undefined) {
            channel.updateDescription(updateData.description);
        }

        if (updateData.privacy === 'private') {
            channel.makePrivate();
        } else if (updateData.privacy === 'public') {
            channel.makePublic();
        }

        if (updateData.is_active !== undefined) {
            if (updateData.is_active) {
                channel.reactivate();
            } else {
                channel.archive();
            }
        }

        const updated = await this.channelRepository.update(channelId, channel);
        if (!updated) {
            throw new AppError(ErrorMessage.FAILED_TO_UPDATE_CHANNEL, HttpStatusCode.INTERNAL_SERVER);
        }

        return updated;
    }
}
