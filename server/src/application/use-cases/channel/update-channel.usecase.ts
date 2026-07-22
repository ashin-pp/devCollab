import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { AppError } from "../../../domain/errors/AppError";
import { UpdateChannelDetailsRequestDto } from "../../dtos/channel/request/update-channel-details-request.dto";
import { ChannelResponseDto } from "../../dtos/channel/response/channel.response.dto";
import { IUpdateChannelUseCase } from "../../interfaces/use-cases/channel/update-channel.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class UpdateChannelUseCase implements IUpdateChannelUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository
    ) { }

    async execute(payload: UpdateChannelDetailsRequestDto): Promise<ChannelResponseDto> {
        const { workspaceId, channelId, requestUserId, updateData } = payload;
        if (!workspaceId || !channelId) {
            throw new AppError(ErrorMessage.INVALID_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this._channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy !== requestUserId) {
            const workspaceMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requestUserId);
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

        const updated = await this._channelRepository.update(channelId, channel);
        if (!updated) {
            throw new AppError(ErrorMessage.FAILED_TO_UPDATE_CHANNEL, HttpStatusCode.INTERNAL_SERVER);
        }

        return {
            id: updated.id as string,
            workspaceId: updated.workspaceId,
            name: updated.name,
            description: updated.description,
            privacy: channel.privacy,
            createdBy: updated.createdBy,
            isActive: updated.isActive,
            createdAt: updated.createdAt as Date,
            updatedAt: updated.updatedAt as Date
        };
    }
}
