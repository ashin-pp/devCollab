import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { Poll } from "../../../domain/entities/poll.entity";

@injectable()
export class VotePollUseCase {
    constructor(
        @inject(TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
    ) {}

    async execute(pollId: string, userId: string, optionId: string): Promise<Poll> {
        const poll = await this._pollRepository.findById(pollId);
        
        if (!poll) {
            throw new Error("Poll not found");
        }

        if (!poll.isActive) {
            throw new Error("Poll is no longer active");
        }

        if (poll.isExpired()) {
            poll.deactivate();
            await this._pollRepository.update(pollId, { isActive: false });
            throw new Error("Poll has expired");
        }

        poll.addVote(userId, optionId, false);

        const updated = await this._pollRepository.update(pollId, { options: poll.options });
        if (!updated) {
             throw new Error("Failed to update poll");
        }
        return updated;
    }
}
