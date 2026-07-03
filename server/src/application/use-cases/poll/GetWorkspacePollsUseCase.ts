import { IPollRepository } from "../../repositories/IPollRepository";
import { Poll } from "../../../domain/entities/Poll";

export class GetWorkspacePollsUseCase {
    constructor(private readonly pollRepository: IPollRepository) {}

    async execute(workspaceId: string): Promise<Poll[]> {
        if (!workspaceId) {
            throw new Error("Workspace ID is required");
        }
        
        return await this.pollRepository.findByWorkspace(workspaceId);
    }
}
