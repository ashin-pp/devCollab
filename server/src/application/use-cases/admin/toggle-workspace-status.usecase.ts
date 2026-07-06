import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class ToggleWorkspaceStatusUseCase implements IBaseUseCase<{workspaceId: string, isActive: boolean}, void> {
    constructor(
        @inject(TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository
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
