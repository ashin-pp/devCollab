import { IWorkspaceRepository } from "../../../application/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../application/repositories/IWorkspaceMemberRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";

export class RemoveWorkspaceMemberUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(workspaceId: string, requesterId: string, targetUserId: string): Promise<void> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const requesterMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requesterId);
        if (!requesterMember) {
            throw new AppError(ErrorMessage.NOT_A_WORKSPACE_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        if (requesterId !== targetUserId) {
            if (requesterMember.role !== MemberRole.OWNER) {
                throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
            }
        } else if (requesterMember.role === MemberRole.OWNER) {
            throw new AppError(ErrorMessage.OWNER_CANNOT_LEAVE, HttpStatusCode.BAD_REQUEST);
        }

        const targetMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUserId);
        if (!targetMember) {
            throw new AppError(ErrorMessage.TARGET_NOT_IN_WORKSPACE, HttpStatusCode.NOT_FOUND);
        }

        await this.workspaceMemberRepository.remove(workspaceId, targetUserId);
    }
}
