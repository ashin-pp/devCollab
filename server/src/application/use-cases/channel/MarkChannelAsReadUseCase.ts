import { IChannelMemberRepository } from "../../../domain/repositories/IChannelMemberRepository";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class MarkChannelAsReadUseCase {
    constructor(
        private channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(channelId: string, userId: string) {
        const membership = await this.channelMemberRepository.findByChannelIdAndUserId(channelId, userId);
        
        if (!membership) {
            return {
                success: false,
                message: 'Not a member of this channel',
                statusCode: HttpStatusCode.FORBIDDEN
            };
        }

        await this.channelMemberRepository.updateLastReadAt(channelId, userId, new Date());

        return {
            success: true,
            message: 'Channel marked as read',
            statusCode: HttpStatusCode.OK
        };
    }
}
