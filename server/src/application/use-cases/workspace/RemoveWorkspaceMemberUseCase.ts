import { IWorkspaceRepository } from "../../../domain/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../domain/repositories/IWorkspaceMemberRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

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
            throw new AppError("You are not a member of this workspace", HttpStatusCode.FORBIDDEN);
        }

        if (requesterId !== targetUserId) {
            if (requesterMember.role !== 'owner') {
                throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
            }
        } else if (requesterMember.role === 'owner') {
            throw new AppError("Owner cannot leave the workspace. Delete the workspace instead.", HttpStatusCode.BAD_REQUEST);
        }

        const targetMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUserId);
        if (!targetMember) {
            throw new AppError("Target user is not a member of this workspace", HttpStatusCode.NOT_FOUND);
        }

        await this.workspaceMemberRepository.remove(workspaceId, targetUserId);
    }
}
