import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { UpdateChannelRequestDto } from "../../dtos/channel/request/update-channel-request.dto";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class UpdateChannelRequestUseCase implements IBaseUseCase<UpdateChannelRequestDto, { success: boolean; message: string }> {
    constructor(
        @inject(TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(TOKENS.IChannelRepository) private _channelRepository: IChannelRepository
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
