import { inject, injectable } from 'tsyringe';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { PollResponseDto } from "../../dtos/poll/response/poll.response.dto";
import { IClosePollUseCase } from "../../interfaces/use-cases/poll/close-poll.usecase.interface";
import { toPollResponseDto } from "../../mappers/poll.mapper";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class ClosePollUseCase implements IClosePollUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
    ) {}

    async execute(pollId: string, userId: string): Promise<PollResponseDto> {
        const poll = await this._pollRepository.findById(pollId);
        if (!poll) {
            throw new AppError(ErrorMessage.POLL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (poll.createdBy !== userId) {
            throw new AppError(ErrorMessage.POLL_CREATOR_CLOSE_ONLY, HttpStatusCode.FORBIDDEN);
        }

        if (!poll.isActive) {
            throw new AppError(ErrorMessage.POLL_ALREADY_CLOSED, HttpStatusCode.BAD_REQUEST);
        }

        const updatedPoll = await this._pollRepository.update(pollId, {
            isActive: false,
            expiresAt: new Date()
        });

        if (!updatedPoll) {
            throw new AppError(ErrorMessage.FAILED_TO_CLOSE_POLL, HttpStatusCode.INTERNAL_SERVER);
        }

        return toPollResponseDto(updatedPoll);
    }
}
