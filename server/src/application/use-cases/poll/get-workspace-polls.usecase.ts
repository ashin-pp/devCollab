import { inject, injectable } from 'tsyringe';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { PollResponseDto } from "../../dtos/poll/response/poll.response.dto";
import { IGetWorkspacePollsUseCase } from "../../interfaces/use-cases/poll/get-workspace-polls.usecase.interface";
import { toPollResponseDto } from "../../mappers/poll.mapper";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetWorkspacePollsUseCase implements IGetWorkspacePollsUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
    ) {}

    async execute(workspaceId: string): Promise<PollResponseDto[]> {
        const polls = await this._pollRepository.findByWorkspace(workspaceId);
        return polls.map(toPollResponseDto);
    }
}
