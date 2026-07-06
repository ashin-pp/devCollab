import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { Poll } from "../../../domain/entities/poll.entity";

@injectable()
export class GetChannelPollsUseCase {
    constructor(
        @inject(TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
    ) {}

    async execute(channelId: string): Promise<Poll[]> {
        if (!channelId) {
            throw new Error("Channel ID is required");
        }
        
        return await this._pollRepository.findByChannel(channelId);
    }
}
