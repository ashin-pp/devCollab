import { IWorkspaceRepository } from "../../../domain/repositories/IWorkspaceRepository";
import { Workspace } from "../../../domain/entities/Workspace";

export class GetPublicWorkspacesUseCase {
    constructor(private workspaceRepository: IWorkspaceRepository) {}

    async execute(): Promise<Workspace[]> {
        return await this.workspaceRepository.findPublicWorkspaces();
    }
}
