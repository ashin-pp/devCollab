import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import { Message } from "../../../domain/entities/message.entity";
import { IGetUnreadMessagesUseCase } from "../../interfaces/use-cases/channel/get-unread-messages.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetUnreadMessagesUseCase implements IGetUnreadMessagesUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IMessageRepository) private _messageRepository: IMessageRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository
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
