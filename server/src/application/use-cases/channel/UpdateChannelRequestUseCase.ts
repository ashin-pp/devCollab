import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";

export class UpdateChannelRequestUseCase {
    constructor(
        private channelMemberRepository: IChannelMemberRepository,
        private channelRepository: IChannelRepository
    ) {}

    async execute(workspaceId: string, channelId: string, userId: string, action: 'approve' | 'reject', adminId: string): Promise<{ success: boolean; message: string }> {
        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy !== adminId) {
            throw new AppError(ErrorMessage.ONLY_CREATOR_MANAGES_REQUESTS, HttpStatusCode.FORBIDDEN);
        }

        const member = await this.channelMemberRepository.findByChannelAndUser(channelId, userId);
        if (!member) {
            throw new AppError(ErrorMessage.CHANNEL_REQUEST_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (member.status !== ChannelMemberStatus.PENDING) {
            throw new AppError(ErrorMessage.CHANNEL_MEMBER_NOT_PENDING, HttpStatusCode.BAD_REQUEST);
        }

        if (action === 'approve') {
            await this.channelMemberRepository.updateStatus(channelId, userId, ChannelMemberStatus.APPROVED);
            return { success: true, message: "Request approved" };
        } else {
            await this.channelMemberRepository.remove(channelId, userId);
            return { success: true, message: "Request rejected" };
        }
    }
}
