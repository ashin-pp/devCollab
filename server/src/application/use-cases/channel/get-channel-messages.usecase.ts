import { inject, injectable } from 'tsyringe';
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import { Message } from "../../../domain/entities/message.entity";
import { IGetChannelMessagesUseCase } from "../../interfaces/use-cases/channel/get-channel-messages.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetChannelMessagesUseCase implements IGetChannelMessagesUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IMessageRepository) private _messageRepository: IMessageRepository
    ) {}

    async execute(payload: {
        channelId: string;
        page?: number;
        limit?: number;
        viewerId: string;
    }): Promise<Message[]> {
        const { channelId, page = 1, limit = 50, viewerId } = payload;
        const skip = (page - 1) * limit;
        const messages = await this._messageRepository.findByChannelId(channelId, limit, skip);

        const rootIds = messages
            .map(m => m.id)
            .filter((id): id is string => Boolean(id));

        const replyCounts = await this._messageRepository.countVisibleRepliesByRootIds(rootIds, viewerId);

        for (const message of messages) {
            if (message.id) {
                message.replyCount = replyCounts[message.id] || 0;
            }
        }

        return messages;
    }
}
