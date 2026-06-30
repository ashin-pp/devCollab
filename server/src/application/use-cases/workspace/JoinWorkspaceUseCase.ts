import { IWorkspaceRepository } from "../../../application/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../application/repositories/IWorkspaceMemberRepository";
import { WorkspaceMember } from "../../../domain/entities/WorkspaceMember";
import { JoinWorkspaceDto } from "../../dto/JoinWorkspaceDto";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { WorkspacePrivacy } from "../../../domain/enums/WorkspacePrivacy";

export class JoinWorkspaceUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) { }

    async execute(data: JoinWorkspaceDto): Promise<WorkspaceMember> {
        if (!data.inviteCode || !data.userId) {
            throw new AppError(ErrorMessage.INVITE_CODE_REQUIRED, HttpStatusCode.BAD_REQUEST);
        }

        const workspace = await this.workspaceRepository.findByInviteCode(data.inviteCode);

        if (!workspace || !workspace.id) {
            throw new AppError(ErrorMessage.INVALID_INVITE_CODE, HttpStatusCode.NOT_FOUND);
        }

        if (!workspace.isActive) {
            throw new AppError(ErrorMessage.WORKSPACE_INACTIVE, HttpStatusCode.FORBIDDEN);
        }

        const currentMembersCount = await this.workspaceMemberRepository.countMembersInWorkspace(workspace.id);
        workspace.setCurrentMemberCount(currentMembersCount);

        if (!workspace.canAddMember()) {
            throw new AppError(ErrorMessage.WORKSPACE_FULL, HttpStatusCode.BAD_REQUEST);
        }

        const existingMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspace.id, data.userId);

        if (existingMember) {
            if (existingMember.status === MemberStatus.BLOCKED) {
                throw new AppError(ErrorMessage.MEMBER_BLOCKED, HttpStatusCode.FORBIDDEN);
            }
            if (existingMember.status === MemberStatus.INVITED) {
                const updatedMember = await this.workspaceMemberRepository.updateStatus(workspace.id, data.userId, MemberStatus.APPROVED);
                return updatedMember || existingMember;
            }
            if (existingMember.status === MemberStatus.PENDING) {
                throw new AppError(ErrorMessage.WORKSPACE_JOIN_REQUEST_PENDING, HttpStatusCode.CONFLICT);
            }
            throw new AppError(ErrorMessage.ALREADY_WORKSPACE_MEMBER, HttpStatusCode.CONFLICT);
        }

        if (workspace.privacy === WorkspacePrivacy.PRIVATE && data.isFromEmailLink) {
            throw new AppError(ErrorMessage.INVITE_LINK_EXPIRED, HttpStatusCode.FORBIDDEN);
        }

        const initialStatus = workspace.privacy === WorkspacePrivacy.PRIVATE
            ? MemberStatus.PENDING
            : MemberStatus.APPROVED;

        const newMember = new WorkspaceMember(
            workspace.id,
            data.userId,
            MemberRole.MEMBER,
            initialStatus
        );

        return await this.workspaceMemberRepository.create(newMember);
    }
}
