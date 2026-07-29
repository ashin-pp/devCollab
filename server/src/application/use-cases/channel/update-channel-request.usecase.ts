import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { UpdateChannelRequestDto } from "../../dtos/channel/request/update-channel-request.dto";

import { IUpdateChannelRequestUseCase } from "../../interfaces/use-cases/channel/update-channel-request.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class UpdateChannelRequestUseCase implements IUpdateChannelRequestUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository
    ) {}

    async execute(payload: UpdateChannelRequestDto): Promise<{ success: boolean; message: string }> {
        const { workspaceId, channelId, userId, action, adminId } = payload;
        const channel = await this._channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy !== adminId) {
            throw new AppError(ErrorMessage.ONLY_CREATOR_MANAGES_REQUESTS, HttpStatusCode.FORBIDDEN);
        }

        const member = await this._channelMemberRepository.findByChannelAndUser(channelId, userId);
        if (!member) {
            throw new AppError(ErrorMessage.CHANNEL_REQUEST_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (member.status !== ChannelMemberStatus.PENDING) {
            throw new AppError(ErrorMessage.CHANNEL_MEMBER_NOT_PENDING, HttpStatusCode.BAD_REQUEST);
        }

        if (action === 'approve') {
            await this._channelMemberRepository.updateStatus(channelId, userId, ChannelMemberStatus.APPROVED);
            return { success: true, message: "Request approved" };
        } else {
            await this._channelMemberRepository.remove(channelId, userId);
            return { success: true, message: "Request rejected" };
        }
    }
}
