import { inject, injectable } from 'tsyringe';
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { WorkspaceMember } from "../../../domain/entities/workspace-member.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { WorkspacePrivacy } from "../../../domain/enums/WorkspacePrivacy";
import { AppError } from "../../../domain/errors/AppError";
import { JoinWorkspaceRequestDto } from "../../dtos/workspace/request/join-workspace.dto";
import { WorkspaceMemberResponseDto } from "../../dtos/workspace/response/workspace-member.response.dto";
import { IJoinWorkspaceUseCase } from "../../interfaces/use-cases/workspace/join-workspace.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class JoinWorkspaceUseCase implements IJoinWorkspaceUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
    ) { }

    async execute(payload: JoinWorkspaceRequestDto): Promise<WorkspaceMemberResponseDto> {
        if (!payload.inviteCode || !payload.userId) {
            throw new AppError(ErrorMessage.INVITE_CODE_REQUIRED, HttpStatusCode.BAD_REQUEST);
        }

        const workspace = await this._workspaceRepository.findByInviteCode(payload.inviteCode);

        if (!workspace || !workspace.id) {
            throw new AppError(ErrorMessage.INVALID_INVITE_CODE, HttpStatusCode.NOT_FOUND);
        }

        if (!workspace.isActive) {
            throw new AppError(ErrorMessage.WORKSPACE_INACTIVE, HttpStatusCode.FORBIDDEN);
        }

        const currentMembersCount = await this._workspaceMemberRepository.countMembersInWorkspace(workspace.id);
        workspace.setCurrentMemberCount(currentMembersCount);

        if (!workspace.canAddMember()) {
            throw new AppError(ErrorMessage.WORKSPACE_FULL, HttpStatusCode.BAD_REQUEST);
        }

        const existingMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspace.id, payload.userId);

        if (existingMember) {
            if (existingMember.status === MemberStatus.BLOCKED) {
                throw new AppError(ErrorMessage.MEMBER_BLOCKED, HttpStatusCode.FORBIDDEN);
            }
            if (existingMember.status === MemberStatus.INVITED) {
                const updatedMember = await this._workspaceMemberRepository.updateStatus(workspace.id, payload.userId, MemberStatus.APPROVED);
                const mem = updatedMember || existingMember;
                return {
                    id: mem.id as string,
                    workspaceId: mem.workspaceId,
                    userId: mem.userId,
                    role: mem.role,
                    status: mem.status,
                    joinedAt: mem.joinedAt as Date as Date
                };
            }
            if (existingMember.status === MemberStatus.PENDING) {
                throw new AppError(ErrorMessage.WORKSPACE_JOIN_REQUEST_PENDING, HttpStatusCode.CONFLICT);
            }
            throw new AppError(ErrorMessage.ALREADY_WORKSPACE_MEMBER, HttpStatusCode.CONFLICT);
        }

        if (workspace.privacy === WorkspacePrivacy.PRIVATE && payload.isFromEmailLink) {
            throw new AppError(ErrorMessage.INVITE_LINK_EXPIRED, HttpStatusCode.FORBIDDEN);
        }

        const initialStatus = workspace.privacy === WorkspacePrivacy.PRIVATE
            ? MemberStatus.PENDING
            : MemberStatus.APPROVED;

        const newMember = new WorkspaceMember(
            workspace.id,
            payload.userId,
            MemberRole.MEMBER,
            initialStatus
        );

        const createdMember = await this._workspaceMemberRepository.create(newMember);

        return {
            id: createdMember.id as string,
            workspaceId: createdMember.workspaceId,
            userId: createdMember.userId,
            role: createdMember.role,
            status: createdMember.status,
            joinedAt: createdMember.joinedAt as Date as Date
        };
    }
}
