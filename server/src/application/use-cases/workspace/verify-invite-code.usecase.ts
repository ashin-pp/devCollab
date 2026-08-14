import { inject, injectable } from 'tsyringe';
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { WorkspaceResponseDto } from "../../dtos/workspace/response/workspace.response.dto";
import { IVerifyInviteCodeUseCase } from "../../interfaces/use-cases/workspace/verify-invite-code.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class VerifyInviteCodeUseCase implements IVerifyInviteCodeUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository
    ) { }

    async execute(payload: { inviteCode: string }): Promise<Partial<WorkspaceResponseDto>> {
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
