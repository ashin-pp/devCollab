import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IEmailService } from "../../../application/interfaces/services/email.service.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { WorkspaceMember } from "../../../domain/entities/workspace-member.entity";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { WorkspacePrivacy } from "../../../domain/enums/WorkspacePrivacy";
import { CreateNotificationUseCase } from "../notification/create-notification.usecase";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class SendWorkspaceInviteUseCase implements IBaseUseCase<{workspaceId: string, requesterId: string, targetEmail: string}, { success: boolean; message: string }> {
    constructor(
        @inject(TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.IEmailService) private _emailService: IEmailService,
        @inject(CreateNotificationUseCase) private _createNotificationUseCase?: CreateNotificationUseCase
    ) {}

    async execute(payload: {workspaceId: string, requesterId: string, targetEmail: string}): Promise<{ success: boolean; message: string }> {
        const { workspaceId, requesterId, targetEmail } = payload;
        if (!workspaceId || !requesterId || !targetEmail) {
            throw new AppError(ErrorMessage.INVITE_FIELDS_REQUIRED, HttpStatusCode.BAD_REQUEST);
        }

        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace || !workspace.id) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const requesterMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspace.id, requesterId);
        if (!requesterMember || requesterMember.status !== MemberStatus.APPROVED) {
            throw new AppError(ErrorMessage.NOT_APPROVED_WORKSPACE_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        if (workspace.privacy === WorkspacePrivacy.PRIVATE && requesterMember.role !== MemberRole.OWNER) {
            throw new AppError(ErrorMessage.ONLY_OWNER_CAN_INVITE_PRIVATE, HttpStatusCode.FORBIDDEN);
        }

        const targetUser = await this._userRepository.findByEmail(targetEmail.toLowerCase());
        if (!targetUser || !targetUser.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND_WITH_EMAIL, HttpStatusCode.NOT_FOUND);
        }

        const existingMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspace.id, targetUser.id);
        if (existingMember) {
            if (existingMember.status === MemberStatus.BLOCKED) {
                throw new AppError(ErrorMessage.MEMBER_BLOCKED_FROM_WORKSPACE, HttpStatusCode.BAD_REQUEST);
            }
            if (existingMember.status === MemberStatus.APPROVED) {
                throw new AppError(ErrorMessage.MEMBER_ALREADY_IN_WORKSPACE, HttpStatusCode.BAD_REQUEST);
            }
            if (existingMember.status === MemberStatus.PENDING || existingMember.status === MemberStatus.INVITED) {
                await this._workspaceMemberRepository.updateStatus(workspace.id, targetUser.id, MemberStatus.INVITED);
            }
        } else {
            const newMember = new WorkspaceMember(
                workspace.id,
                targetUser.id,
                MemberRole.MEMBER,
                MemberStatus.INVITED,
                new Date()
            );
            await this._workspaceMemberRepository.create(newMember);
        }

        const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?inviteCode=${workspace.inviteCode}`;

        await this._emailService.sendWorkspaceInviteEmail(
            targetUser.email,
            workspace.name,
            inviteLink
        );

        if (this._createNotificationUseCase && targetUser.id) {
            await this._createNotificationUseCase.execute({
                userId: targetUser.id,
                type: 'WORKSPACE_INVITE',
                title: 'Workspace Invitation',
                message: `You have been invited to join the workspace "${workspace.name}".`,
                relatedId: workspace.id
            });
        }

        return { success: true, message: "Invitation sent successfully" };
    }
}
