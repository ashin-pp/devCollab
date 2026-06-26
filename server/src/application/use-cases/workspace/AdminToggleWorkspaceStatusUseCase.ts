import { IWorkspaceRepository } from "../../../application/repositories/IWorkspaceRepository";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class AdminToggleWorkspaceStatusUseCase {
    constructor(private workspaceRepository: IWorkspaceRepository) {}

    async execute(workspaceId: string, isActive: boolean): Promise<void> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const updated = await this.workspaceRepository.update(workspaceId, { isActive });
        if (!updated) {
            throw new AppError(ErrorMessage.FAILED_TO_UPDATE_WORKSPACE_STATUS, HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
