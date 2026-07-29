import { inject, injectable } from 'tsyringe';
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { IToggleWorkspaceStatusUseCase } from "../../interfaces/use-cases/admin/toggle-workspace-status.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class ToggleWorkspaceStatusUseCase implements IToggleWorkspaceStatusUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository
    ) {}

    async execute(payload: {workspaceId: string, isActive: boolean}): Promise<void> {
        const { workspaceId, isActive } = payload;
        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const updated = await this._workspaceRepository.update(workspaceId, { isActive });
        if (!updated) {
            throw new AppError(ErrorMessage.FAILED_TO_UPDATE_WORKSPACE_STATUS, HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
