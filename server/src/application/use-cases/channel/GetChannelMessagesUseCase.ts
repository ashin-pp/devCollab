import { IMessageRepository } from "../../../domain/repositories/IMessageRepository";
import { Message } from "../../../domain/entities/Message";

export class GetChannelMessagesUseCase {
    constructor(private messageRepository: IMessageRepository) {}

    async execute(channelId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
        const skip = (page - 1) * limit;
        return await this.messageRepository.findByChannelId(channelId, limit, skip);
    }
}
