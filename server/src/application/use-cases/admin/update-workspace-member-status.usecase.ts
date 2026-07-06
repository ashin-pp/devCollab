import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { MemberStatus } from "../../../domain/enums/MemberStatus";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class UpdateWorkspaceMemberStatusUseCase implements IBaseUseCase<{workspaceId: string, userId: string, status: MemberStatus}, void> {
    constructor(
        @inject(TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
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
