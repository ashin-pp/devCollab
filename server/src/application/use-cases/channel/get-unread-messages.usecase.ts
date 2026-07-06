import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import { Message } from "../../../domain/entities/message.entity";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class GetUnreadMessagesUseCase implements IBaseUseCase<{channelId: string, userId: string}, Message[]> {
    constructor(
        @inject(TOKENS.IMessageRepository) private _messageRepository: IMessageRepository,
        @inject(TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(payload: {channelId: string, userId: string}): Promise<Message[]> {
        const { channelId, userId } = payload;
        const member = await this._channelMemberRepository.findByChannelAndUser(channelId, userId);
        
        if (!member) {
            throw new Error("User is not a member of this channel");
        }

        // If lastReadAt is not set, they've never read anything. 
        // We'll fallback to fetching the last 50 messages (or all, but we don't want to fetch millions)
        // Let's use joinedAt as a fallback date if lastReadAt is undefined
        const dateToCompare = member.lastReadAt || member.joinedAt || new Date(0);

        return await this._messageRepository.findUnreadMessages(channelId, dateToCompare);
    }
}
