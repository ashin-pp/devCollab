import { inject, injectable } from 'tsyringe';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { Poll } from "../../../domain/entities/poll.entity";
import { AppError } from "../../../domain/errors/AppError";
import { IClosePollUseCase } from "../../interfaces/use-cases/poll/close-poll.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class ClosePollUseCase implements IClosePollUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
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
