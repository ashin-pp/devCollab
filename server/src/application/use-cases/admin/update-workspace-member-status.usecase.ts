import { inject, injectable } from 'tsyringe';
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { AppError } from "../../../domain/errors/AppError";
import { IUpdateWorkspaceMemberStatusUseCase } from "../../interfaces/use-cases/admin/update-workspace-member-status.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class UpdateWorkspaceMemberStatusUseCase implements IUpdateWorkspaceMemberStatusUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(payload: {workspaceId: string, userId: string, status: MemberStatus}): Promise<void> {
        const { workspaceId, userId, status } = payload;
        const member = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
        
        if (!member) {
            throw new AppError(ErrorMessage.MEMBER_NOT_FOUND_IN_WORKSPACE, HttpStatusCode.NOT_FOUND);
        }

        if (member.role === MemberRole.OWNER && status === MemberStatus.BLOCKED) {
            throw new AppError(ErrorMessage.CANNOT_BLOCK_OWNER, HttpStatusCode.BAD_REQUEST);
        }

        const updatedMember = await this._workspaceMemberRepository.updateStatus(workspaceId, userId, status);
        if (!updatedMember) {
            throw new AppError(ErrorMessage.FAILED_TO_UPDATE_MEMBER_STATUS, HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
