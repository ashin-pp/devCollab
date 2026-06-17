import { IChannelMemberRepository } from "../../../domain/repositories/IChannelMemberRepository";
import { IChannelRepository } from "../../../domain/repositories/IChannelRepository";

export class UpdateChannelRequestUseCase {
    constructor(
        private channelMemberRepository: IChannelMemberRepository,
        private channelRepository: IChannelRepository
    ) {}

    async execute(workspaceId: string, channelId: string, userId: string, action: 'approve' | 'reject', adminId: string): Promise<{ success: boolean; message: string }> {
        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new Error('Channel not found');
        }

        // Verify admin has permission (must be channel creator)
        if (channel.createdBy !== adminId) {
            throw new Error('Only the channel creator can manage requests');
        }

        const member = await this.channelMemberRepository.findByChannelAndUser(channelId, userId);
        if (!member) {
            throw new Error('Request not found');
        }

        if (member.status !== 'pending') {
            throw new Error('User is not in pending state');
        }

        if (action === 'approve') {
            await this.channelMemberRepository.updateStatus(channelId, userId, 'approved');
            return { success: true, message: 'Request approved' };
        } else {
            // If rejected, we delete the pending record completely so they can request again later if needed
            await this.channelMemberRepository.remove(channelId, userId);
            return { success: true, message: 'Request rejected' };
        }
    }
}
