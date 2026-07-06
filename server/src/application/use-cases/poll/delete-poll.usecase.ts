import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { Poll } from "../../../domain/entities/poll.entity";

@injectable()
export class DeletePollUseCase {
    constructor(
        @inject(TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
    ) {}

    async execute(pollId: string, userId: string): Promise<Poll> {
        const poll = await this._pollRepository.findById(pollId);
        
        if (!poll) {
            throw new Error("Poll not found");
        }

        if (poll.createdBy !== userId) {
            throw new Error("Only the creator can delete this poll");
        }

        await this._pollRepository.delete(pollId);
        return poll;
    }
}
