import { IWorkspaceMemberRepository } from "../../../domain/repositories/IWorkspaceMemberRepository";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class AdminUpdateWorkspaceMemberStatusUseCase {
    constructor(private workspaceMemberRepository: IWorkspaceMemberRepository) {}

    async execute(workspaceId: string, userId: string, status: 'approved' | 'blocked' | 'pending'): Promise<void> {
        const member = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
        
        if (!member) {
            throw new AppError(ErrorMessage.MEMBER_NOT_FOUND_IN_WORKSPACE, HttpStatusCode.NOT_FOUND);
        }

        if (member.role === 'owner' && status === 'blocked') {
            throw new AppError(ErrorMessage.CANNOT_BLOCK_OWNER, HttpStatusCode.BAD_REQUEST);
        }

        const updatedMember = await this.workspaceMemberRepository.updateStatus(workspaceId, userId, status);
        if (!updatedMember) {
            throw new AppError(ErrorMessage.FAILED_TO_UPDATE_MEMBER_STATUS, HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
