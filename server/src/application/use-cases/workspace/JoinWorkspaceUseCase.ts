import { IWorkspaceRepository } from "../../../domain/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../domain/repositories/IWorkspaceMemberRepository";
import { WorkspaceMember } from "../../../domain/entities/WorkspaceMember";
import { JoinWorkspaceDto } from "../../dto/JoinWorkspaceDto";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class JoinWorkspaceUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

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
        
        if (currentMembersCount >= workspace.maxMembers) {
            throw new AppError(ErrorMessage.WORKSPACE_FULL, HttpStatusCode.BAD_REQUEST);
        }

        const existingMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspace.id, data.userId);
        
        if (existingMember) {
            if (existingMember.status === 'blocked') {
                throw new AppError("You have been blocked from joining this workspace", HttpStatusCode.FORBIDDEN);
            }
            throw new AppError(ErrorMessage.ALREADY_WORKSPACE_MEMBER, HttpStatusCode.CONFLICT);
        }

        const newMember = new WorkspaceMember(
            workspace.id,
            data.userId,
            'member',
            workspace.privacy === 'private' ? 'pending' : 'approved'
        );

        const createdMember = await this.workspaceMemberRepository.create(newMember);

        return createdMember;
    }
}
