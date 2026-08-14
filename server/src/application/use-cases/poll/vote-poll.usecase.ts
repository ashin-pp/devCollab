import { inject, injectable } from 'tsyringe';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { PollResponseDto } from "../../dtos/poll/response/poll.response.dto";
import { IVotePollUseCase } from "../../interfaces/use-cases/poll/vote-poll.usecase.interface";
import { toPollResponseDto } from "../../mappers/poll.mapper";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class VotePollUseCase implements IVotePollUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
    ) {}

    async execute(pollId: string, userId: string, optionId: string): Promise<PollResponseDto> {
        const poll = await this._pollRepository.findById(pollId);
        
        if (!poll) {
            throw new AppError(ErrorMessage.POLL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (!poll.isActive) {
            throw new AppError(ErrorMessage.POLL_INACTIVE, HttpStatusCode.BAD_REQUEST);
        }

        if (poll.isExpired()) {
            poll.deactivate();
            await this._pollRepository.update(pollId, { isActive: false });
            throw new AppError(ErrorMessage.POLL_EXPIRED, HttpStatusCode.BAD_REQUEST);
        }

        poll.addVote(userId, optionId, false);

        const updated = await this._pollRepository.update(pollId, { options: poll.options });
        if (!updated) {
             throw new AppError(ErrorMessage.FAILED_TO_UPDATE_POLL, HttpStatusCode.INTERNAL_SERVER);
        }
        return toPollResponseDto(updated);
    }
}
