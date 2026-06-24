import { IWorkspaceRepository } from "../../../application/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../application/repositories/IWorkspaceMemberRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";

export class DeleteWorkspaceUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(workspaceId: string, ownerId: string): Promise<void> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const ownerMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, ownerId);
        if (!ownerMember || ownerMember.role !== MemberRole.OWNER) {
            throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
        }

        await this.workspaceMemberRepository.removeAllFromWorkspace(workspaceId);

        const deleted = await this.workspaceRepository.delete(workspaceId);
        if (!deleted) {
            throw new AppError(ErrorMessage.FAILED_TO_DELETE_WORKSPACE, HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
