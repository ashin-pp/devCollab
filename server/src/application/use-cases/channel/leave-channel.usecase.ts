import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { ILeaveChannelUseCase } from "../../interfaces/use-cases/channel/leave-channel.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class LeaveChannelUseCase implements ILeaveChannelUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(payload: {workspaceId: string, channelId: string, requestUserId: string}): Promise<boolean> {
        const { workspaceId, channelId, requestUserId } = payload;
        if (!workspaceId || !channelId) {
            throw new AppError(ErrorMessage.INVALID_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this._channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy === requestUserId) {
            throw new AppError(ErrorMessage.CHANNEL_CREATOR_CANNOT_LEAVE, HttpStatusCode.BAD_REQUEST);
        }

        const success = await this._channelMemberRepository.remove(channelId, requestUserId);
        if (!success) {
            throw new AppError(ErrorMessage.NOT_CHANNEL_MEMBER, HttpStatusCode.NOT_FOUND);
        }

        return true;
    }
}
