import { inject, injectable } from 'tsyringe';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { PollResponseDto } from "../../dtos/poll/response/poll.response.dto";
import { IDeletePollUseCase } from "../../interfaces/use-cases/poll/delete-poll.usecase.interface";
import { toPollResponseDto } from "../../mappers/poll.mapper";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class DeletePollUseCase implements IDeletePollUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
    ) {}

    async execute(pollId: string, userId: string): Promise<PollResponseDto> {
        const poll = await this._pollRepository.findById(pollId);

        if (!poll) {
            throw new AppError(ErrorMessage.POLL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (poll.createdBy !== userId) {
            throw new AppError(ErrorMessage.POLL_CREATOR_DELETE_ONLY, HttpStatusCode.FORBIDDEN);
        }

        await this._pollRepository.delete(pollId);
        return toPollResponseDto(poll);
    }
}
