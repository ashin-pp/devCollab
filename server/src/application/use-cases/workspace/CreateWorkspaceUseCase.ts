import { IWorkspaceRepository } from "../../../domain/repositories/IWorkspaceRepository";
import { IWorkspaceMemberRepository } from "../../../domain/repositories/IWorkspaceMemberRepository";
import { Workspace } from "../../../domain/entities/Workspace";
import { WorkspaceMember } from "../../../domain/entities/WorkspaceMember";
import { CreateWorkspaceDto } from "../../dto/CreateWorkspaceDto";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import crypto from "crypto";

export class CreateWorkspaceUseCase {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(data: CreateWorkspaceDto): Promise<Workspace> {
        if (!data.name || !data.createdBy) {
            throw new AppError(ErrorMessage.WORKSPACE_NAME_REQUIRED, HttpStatusCode.BAD_REQUEST);
        }

        const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        const newWorkspace = new Workspace(
            data.name,
            inviteCode,
            data.createdBy,
            data.description,
            data.logo,
            data.privacy || 'private',
            data.maxMembers
        );

        const createdWorkspace = await this.workspaceRepository.create(newWorkspace);

        if (!createdWorkspace.id) {
            throw new AppError(ErrorMessage.FAILED_TO_CREATE_WORKSPACE, HttpStatusCode.INTERNAL_SERVER);
        }

        const ownerMember = new WorkspaceMember(
            createdWorkspace.id,
            data.createdBy,
            'owner'
        );

        await this.workspaceMemberRepository.create(ownerMember);

        return createdWorkspace;
    }
}
