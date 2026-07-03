import { IPollRepository } from "../../repositories/IPollRepository";
import { AppError } from "../../../domain/errors/AppError";
import { Poll } from "../../../domain/entities/Poll";

export class ClosePollUseCase {
    constructor(private readonly pollRepository: IPollRepository) {}

    async execute(pollId: string, userId: string): Promise<Poll> {
        const poll = await this.pollRepository.findById(pollId);
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
        const updatedPoll = await this.pollRepository.update(pollId, { 
            isActive: false,
            expiresAt: new Date()
        });

        if (!updatedPoll) {
            throw new AppError("Failed to close poll", 500);
        }
        
        return updatedPoll;
    }
}
