import { IChannelRepository } from "../../../domain/repositories/IChannelRepository";
import { IChannelMemberRepository } from "../../../domain/repositories/IChannelMemberRepository";
import { ChannelMember } from "../../../domain/entities/ChannelMember";

export class JoinChannelUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(workspaceId: string, channelId: string, userId: string): Promise<{ success: boolean; status: string; message: string }> {
        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new Error('Channel not found');
        }

        const existingMember = await this.channelMemberRepository.findByChannelAndUser(channelId, userId);
        if (existingMember) {
            if (existingMember.status === 'approved') {
                throw new Error('User is already a member of this channel');
            } else if (existingMember.status === 'pending') {
                throw new Error('Join request is already pending');
            } else if (existingMember.status === 'rejected') {
                // If rejected previously, allow to request again
                await this.channelMemberRepository.updateStatus(channelId, userId, 'pending');
                return { success: true, status: 'pending', message: 'Join request submitted' };
            }
        }

        const newStatus: 'approved' | 'pending' = channel.privacy === 'public' ? 'approved' : 'pending';
        const member = new ChannelMember(
            channelId,
            userId,
            userId, // self-joined
            'member',
            true,
            newStatus
        );

        await this.channelMemberRepository.create(member);

        return { 
            success: true, 
            status: newStatus,
            message: newStatus === 'approved' ? 'Successfully joined the channel' : 'Join request submitted'
        };
    }
}
