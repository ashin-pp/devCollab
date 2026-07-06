import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class DeleteWorkspaceUseCase implements IBaseUseCase<{workspaceId: string, ownerId: string}, void> {
    constructor(
        @inject(TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(payload: {workspaceId: string, ownerId: string}): Promise<void> {
        const { workspaceId, ownerId } = payload;
        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const ownerMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, ownerId);
        if (!ownerMember || ownerMember.role !== MemberRole.OWNER) {
            throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
        }

        await this._workspaceMemberRepository.removeAllFromWorkspace(workspaceId);

        const deleted = await this._workspaceRepository.delete(workspaceId);
        if (!deleted) {
            throw new AppError(ErrorMessage.FAILED_TO_DELETE_WORKSPACE, HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
