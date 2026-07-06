import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { WorkspaceResponseDto } from "../../dtos/workspace/response/workspace.response.dto";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

@injectable()
export class VerifyInviteCodeUseCase implements IBaseUseCase<{ inviteCode: string }, Partial<WorkspaceResponseDto>> {
    constructor(
        @inject(TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository
    ) { }

    async execute(payload: { inviteCode: string }): Promise<Partial<WorkspaceResponseDto>> {
        if (!payload.inviteCode) {
            throw new AppError(ErrorMessage.INVITE_CODE_REQUIRED, HttpStatusCode.BAD_REQUEST);
        }

        const workspace = await this._workspaceRepository.findByInviteCode(payload.inviteCode);

        if (!workspace || !workspace.id) {
            throw new AppError(ErrorMessage.INVALID_INVITE_CODE, HttpStatusCode.NOT_FOUND);
        }

        if (!workspace.isActive) {
            throw new AppError(ErrorMessage.WORKSPACE_INACTIVE, HttpStatusCode.FORBIDDEN);
        }

        return {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            privacy: workspace.privacy,
            logo: workspace.logo
        };
    }
}
