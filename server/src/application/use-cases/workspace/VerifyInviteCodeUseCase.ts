import { IWorkspaceRepository } from "../../../application/repositories/IWorkspaceRepository";
import { Workspace } from "../../../domain/entities/Workspace";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class VerifyInviteCodeUseCase {
    constructor(private workspaceRepository: IWorkspaceRepository) { }

    async execute(inviteCode: string): Promise<Partial<Workspace>> {
        if (!inviteCode) {
            throw new AppError(ErrorMessage.INVITE_CODE_REQUIRED, HttpStatusCode.BAD_REQUEST);
        }

        const workspace = await this.workspaceRepository.findByInviteCode(inviteCode);

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
