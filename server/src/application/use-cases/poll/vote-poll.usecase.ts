import { inject, injectable } from 'tsyringe';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { Poll } from "../../../domain/entities/poll.entity";
import { IVotePollUseCase } from "../../interfaces/use-cases/poll/vote-poll.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class VotePollUseCase implements IVotePollUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
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
