import { inject, injectable } from 'tsyringe';
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { WorkspaceResponseDto } from "../../dtos/workspace/response/workspace.response.dto";
import { IGetPublicWorkspacesUseCase } from "../../interfaces/use-cases/workspace/get-public-workspaces.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetPublicWorkspacesUseCase implements IGetPublicWorkspacesUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository
    ) {}

    async execute(): Promise<WorkspaceResponseDto[]> {
        const workspaces = await this._workspaceRepository.findPublicWorkspaces();
        return workspaces.map(ws => ({
            id: ws.id as string,
            name: ws.name,
            description: ws.description,
            logo: ws.logo,
            inviteCode: ws.inviteCode,
            createdBy: ws.createdBy,
            privacy: ws.privacy,
            maxMembers: ws.maxMembers,
            isActive: ws.isActive,
            createdAt: ws.createdAt as Date,
            updatedAt: ws.updatedAt as Date
        }));
    }
}
