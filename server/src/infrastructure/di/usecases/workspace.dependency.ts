import { container } from 'tsyringe';
import { USECASE_TOKENS } from "../usecase.tokens";
import { BlockWorkspaceMemberUseCase } from "../../../application/use-cases/workspace/block-workspace-member.usecase";
import { CreateWorkspaceUseCase } from "../../../application/use-cases/workspace/create-workspace.usecase";
import { DeleteWorkspaceUseCase } from "../../../application/use-cases/workspace/delete-workspace.usecase";
import { GetPublicWorkspacesUseCase } from "../../../application/use-cases/workspace/get-public-workspaces.usecase";
import { GetUserWorkspacesUseCase } from "../../../application/use-cases/workspace/get-user-workspaces.usecase";
import { HandleJoinRequestUseCase } from "../../../application/use-cases/workspace/handle-join-request.usecase";
import { JoinWorkspaceUseCase } from "../../../application/use-cases/workspace/join-workspace.usecase";
import { RegenerateInviteCodeUseCase } from "../../../application/use-cases/workspace/regenerate-invite-code.usecase";
import { RemoveWorkspaceMemberUseCase } from "../../../application/use-cases/workspace/remove-workspace-member.usecase";
import { SendWorkspaceInviteUseCase } from "../../../application/use-cases/workspace/send-workspace-invite.usecase";
import { UnblockWorkspaceMemberUseCase } from "../../../application/use-cases/workspace/unblock-workspace-member.usecase";
import { UpdateWorkspaceUseCase } from "../../../application/use-cases/workspace/update-workspace.usecase";
import { VerifyInviteCodeUseCase } from "../../../application/use-cases/workspace/verify-invite-code.usecase";

export function registerWorkspaceUseCases() {
    container.register(USECASE_TOKENS.IBlockWorkspaceMemberUseCase, { useClass: BlockWorkspaceMemberUseCase });
    container.register(USECASE_TOKENS.ICreateWorkspaceUseCase, { useClass: CreateWorkspaceUseCase });
    container.register(USECASE_TOKENS.IDeleteWorkspaceUseCase, { useClass: DeleteWorkspaceUseCase });
    container.register(USECASE_TOKENS.IGetPublicWorkspacesUseCase, { useClass: GetPublicWorkspacesUseCase });
    container.register(USECASE_TOKENS.IGetUserWorkspacesUseCase, { useClass: GetUserWorkspacesUseCase });
    container.register(USECASE_TOKENS.IHandleJoinRequestUseCase, { useClass: HandleJoinRequestUseCase });
    container.register(USECASE_TOKENS.IJoinWorkspaceUseCase, { useClass: JoinWorkspaceUseCase });
    container.register(USECASE_TOKENS.IRegenerateInviteCodeUseCase, { useClass: RegenerateInviteCodeUseCase });
    container.register(USECASE_TOKENS.IRemoveWorkspaceMemberUseCase, { useClass: RemoveWorkspaceMemberUseCase });
    container.register(USECASE_TOKENS.ISendWorkspaceInviteUseCase, { useClass: SendWorkspaceInviteUseCase });
    container.register(USECASE_TOKENS.IUnblockWorkspaceMemberUseCase, { useClass: UnblockWorkspaceMemberUseCase });
    container.register(USECASE_TOKENS.IUpdateWorkspaceUseCase, { useClass: UpdateWorkspaceUseCase });
    container.register(USECASE_TOKENS.IVerifyInviteCodeUseCase, { useClass: VerifyInviteCodeUseCase });
}
