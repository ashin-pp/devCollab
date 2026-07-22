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

    async execute(payload: {channelId: string, page?: number, limit?: number}): Promise<Message[]> {
        const { channelId, page = 1, limit = 50 } = payload;
        const skip = (page - 1) * limit;
        return await this._messageRepository.findByChannelId(channelId, limit, skip);
    }
}
