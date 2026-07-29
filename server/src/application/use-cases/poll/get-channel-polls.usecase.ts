import { inject, injectable } from 'tsyringe';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { Poll } from "../../../domain/entities/poll.entity";
import { IGetChannelPollsUseCase } from "../../interfaces/use-cases/poll/get-channel-polls.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetChannelPollsUseCase implements IGetChannelPollsUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
    ) {}

    async execute(channelId: string): Promise<Poll[]> {
        if (!channelId) {
            throw new Error("Channel ID is required");
        }
        
        return await this._pollRepository.findByChannel(channelId);
    }
}
