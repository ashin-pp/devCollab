import { inject, injectable } from 'tsyringe';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { Poll } from "../../../domain/entities/poll.entity";
import { IDeletePollUseCase } from "../../interfaces/use-cases/poll/delete-poll.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class DeletePollUseCase implements IDeletePollUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
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
