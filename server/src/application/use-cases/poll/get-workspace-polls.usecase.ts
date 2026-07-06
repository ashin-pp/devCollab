import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IPollRepository } from "../../../application/interfaces/repositories/poll.repository.interface";
import { Poll } from "../../../domain/entities/poll.entity";

@injectable()
export class GetWorkspacePollsUseCase {
    constructor(
        @inject(TOKENS.IPollRepository) private readonly _pollRepository: IPollRepository
    ) {}

    async execute(workspaceId: string): Promise<Poll[]> {
        if (!workspaceId) {
            throw new Error("Workspace ID is required");
        }
        
        return await this._pollRepository.findByWorkspace(workspaceId);
    }
}
