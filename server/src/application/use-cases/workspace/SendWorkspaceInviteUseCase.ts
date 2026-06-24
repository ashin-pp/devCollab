import { IWorkspaceRepository } from "../../../application/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../application/repositories/IWorkspaceMemberRepository";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { IEmailService } from "../../../application/services/IEmailService";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { WorkspaceMember } from "../../../domain/entities/WorkspaceMember";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { WorkspacePrivacy } from "../../../domain/enums/WorkspacePrivacy";

export class SendWorkspaceInviteUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository,
        private userRepository: IUserRepository,
        private emailService: IEmailService
    ) {}

    async execute(workspaceId: string, requesterId: string, targetEmail: string) {
        if (!workspaceId || !requesterId || !targetEmail) {
            throw new AppError(ErrorMessage.INVITE_FIELDS_REQUIRED, HttpStatusCode.BAD_REQUEST);
        }

        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace || !workspace.id) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const requesterMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspace.id, requesterId);
        if (!requesterMember || requesterMember.status !== MemberStatus.APPROVED) {
            throw new AppError(ErrorMessage.NOT_APPROVED_WORKSPACE_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        if (workspace.privacy === WorkspacePrivacy.PRIVATE && requesterMember.role !== MemberRole.OWNER) {
            throw new AppError(ErrorMessage.ONLY_OWNER_CAN_INVITE_PRIVATE, HttpStatusCode.FORBIDDEN);
        }

        const targetUser = await this.userRepository.findByEmail(targetEmail.toLowerCase());
        if (!targetUser || !targetUser.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND_WITH_EMAIL, HttpStatusCode.NOT_FOUND);
        }

        const existingMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspace.id, targetUser.id);
        if (existingMember) {
            if (existingMember.status === MemberStatus.BLOCKED) {
                throw new AppError(ErrorMessage.MEMBER_BLOCKED_FROM_WORKSPACE, HttpStatusCode.BAD_REQUEST);
            }
            if (existingMember.status === MemberStatus.APPROVED) {
                throw new AppError(ErrorMessage.MEMBER_ALREADY_IN_WORKSPACE, HttpStatusCode.BAD_REQUEST);
            }
            if (existingMember.status === MemberStatus.PENDING) {
                await this.workspaceMemberRepository.updateStatus(workspace.id, targetUser.id, MemberStatus.APPROVED);
            }
        } else {
            const newMember = new WorkspaceMember(
                workspace.id,
                targetUser.id,
                MemberRole.MEMBER,
                MemberStatus.APPROVED,
                new Date()
            );
            await this.workspaceMemberRepository.create(newMember);
        }

        const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?inviteCode=${workspace.inviteCode}`;

        await this.emailService.sendWorkspaceInviteEmail(
            targetUser.email,
            workspace.name,
            inviteLink
        );

        return { success: true, message: "Invitation sent successfully" };
    }
}
