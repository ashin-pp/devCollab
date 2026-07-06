import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import { Message } from "../../../domain/entities/message.entity";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class GetChannelMessagesUseCase implements IBaseUseCase<{channelId: string, page?: number, limit?: number}, Message[]> {
    constructor(
        @inject(TOKENS.IMessageRepository) private _messageRepository: IMessageRepository
    ) {}

    async execute(payload: {channelId: string, page?: number, limit?: number}): Promise<Message[]> {
        const { channelId, page = 1, limit = 50 } = payload;
        const skip = (page - 1) * limit;
        return await this._messageRepository.findByChannelId(channelId, limit, skip);
    }
}
