import { IWorkspaceRepository } from "../../../domain/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../domain/repositories/IWorkspaceMemberRepository";
import { Workspace } from "../../../domain/entities/Workspace";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

interface UpdateWorkspaceData {
    name?: string;
    description?: string;
    privacy?: 'public' | 'private';
    maxMembers?: number;
}

export class UpdateWorkspaceUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(workspaceId: string, ownerId: string, data: UpdateWorkspaceData): Promise<Workspace> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const ownerMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, ownerId);
        if (!ownerMember || ownerMember.role !== 'owner') {
            throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
        }

        const updatedWorkspace = await this.workspaceRepository.update(workspaceId, data);
        if (!updatedWorkspace) {
            throw new AppError("Failed to update workspace", HttpStatusCode.INTERNAL_SERVER);
        }

        return updatedWorkspace;
    }
}
