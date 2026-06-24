import { IWorkspaceRepository } from "../../../application/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../application/repositories/IWorkspaceMemberRepository";
import { Workspace } from "../../../domain/entities/Workspace";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import crypto from "crypto";

export class RegenerateInviteCodeUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(workspaceId: string, ownerId: string): Promise<Workspace> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const ownerMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, ownerId);
        if (!ownerMember || ownerMember.role !== MemberRole.OWNER) {
            throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
        }

        const newInviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        const updatedWorkspace = await this.workspaceRepository.update(workspaceId, { inviteCode: newInviteCode });
        if (!updatedWorkspace) {
            throw new AppError(ErrorMessage.FAILED_TO_REGENERATE_INVITE_CODE, HttpStatusCode.INTERNAL_SERVER);
        }

        return updatedWorkspace;
    }
}
