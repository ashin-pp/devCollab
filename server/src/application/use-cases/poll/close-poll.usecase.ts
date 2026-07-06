import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { Poll } from "../../../domain/entities/poll.entity";

@injectable()
export class ClosePollUseCase {
    constructor(
        @inject(TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
    ) {}

    async execute(pollId: string, userId: string): Promise<Poll> {
        const poll = await this._pollRepository.findById(pollId);
        if (!poll) {
            throw new AppError("Poll not found", 404);
        }

        if (poll.createdBy !== userId) {
            throw new AppError("Only the creator can close this poll", 403);
        }

        if (!poll.isActive) {
            throw new AppError("Poll is already closed", 400);
        }

        // Close the poll and optionally set expiry to now
        const updatedPoll = await this._pollRepository.update(pollId, { 
            isActive: false,
            expiresAt: new Date()
        });

        if (!updatedPoll) {
            throw new AppError("Failed to close poll", 500);
        }
        
        return updatedPoll;
    }
}
