import { inject, injectable } from 'tsyringe';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { Poll } from "../../../domain/entities/poll.entity";
import { IGetWorkspacePollsUseCase } from "../../interfaces/use-cases/poll/get-workspace-polls.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetWorkspacePollsUseCase implements IGetWorkspacePollsUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
    ) {}

    async execute(workspaceId: string): Promise<Poll[]> {
        if (!workspaceId) {
            throw new Error("Workspace ID is required");
        }
        
        return await this._pollRepository.findByWorkspace(workspaceId);
    }
}
