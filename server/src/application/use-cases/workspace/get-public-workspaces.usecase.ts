import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { WorkspaceResponseDto } from "../../dtos/workspace/response/workspace.response.dto";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class GetPublicWorkspacesUseCase implements IBaseUseCase<{}, WorkspaceResponseDto[]> {
    constructor(
        @inject(TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository
    ) {}

    async execute(payload: {}): Promise<WorkspaceResponseDto[]> {
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
