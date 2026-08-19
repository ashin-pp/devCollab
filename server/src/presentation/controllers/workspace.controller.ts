import { Response } from "express";
import { inject, injectable } from "tsyringe";
import type { IBlockWorkspaceMemberUseCase } from "../../application/interfaces/use-cases/workspace/block-workspace-member.usecase.interface";
import type { ICreateWorkspaceUseCase } from "../../application/interfaces/use-cases/workspace/create-workspace.usecase.interface";
import type { IDeleteWorkspaceUseCase } from "../../application/interfaces/use-cases/workspace/delete-workspace.usecase.interface";
import type { IGetPublicWorkspacesUseCase } from "../../application/interfaces/use-cases/workspace/get-public-workspaces.usecase.interface";
import type { IGetUserWorkspacesUseCase } from "../../application/interfaces/use-cases/workspace/get-user-workspaces.usecase.interface";
import type { IGetWorkspaceMembersUseCase } from "../../application/interfaces/use-cases/workspace/get-workspace-members.usecase.interface";
import type { IHandleJoinRequestUseCase } from "../../application/interfaces/use-cases/workspace/handle-join-request.usecase.interface";
import type { IJoinWorkspaceUseCase } from "../../application/interfaces/use-cases/workspace/join-workspace.usecase.interface";
import type { IRegenerateInviteCodeUseCase } from "../../application/interfaces/use-cases/workspace/regenerate-invite-code.usecase.interface";
import type { IRemoveWorkspaceMemberUseCase } from "../../application/interfaces/use-cases/workspace/remove-workspace-member.usecase.interface";
import type { ISendWorkspaceInviteUseCase } from "../../application/interfaces/use-cases/workspace/send-workspace-invite.usecase.interface";
import type { IUnblockWorkspaceMemberUseCase } from "../../application/interfaces/use-cases/workspace/unblock-workspace-member.usecase.interface";
import type { IUpdateWorkspaceUseCase } from "../../application/interfaces/use-cases/workspace/update-workspace.usecase.interface";
import type { IVerifyInviteCodeUseCase } from "../../application/interfaces/use-cases/workspace/verify-invite-code.usecase.interface";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { SocketService } from "../../infrastructure/socket/socket.service";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";
import { requireUserId } from "../utils/require-user-id";

@injectable()
export class WorkspaceController {
    constructor(
        @inject(USECASE_TOKENS.ICreateWorkspaceUseCase)
        private readonly _createWorkspaceUseCase: ICreateWorkspaceUseCase,
        @inject(USECASE_TOKENS.IJoinWorkspaceUseCase)
        private readonly _joinWorkspaceUseCase: IJoinWorkspaceUseCase,
        @inject(USECASE_TOKENS.IGetUserWorkspacesUseCase)
        private readonly _getUserWorkspacesUseCase: IGetUserWorkspacesUseCase,
        @inject(USECASE_TOKENS.IGetPublicWorkspacesUseCase)
        private readonly _getPublicWorkspacesUseCase: IGetPublicWorkspacesUseCase,
        @inject(USECASE_TOKENS.IVerifyInviteCodeUseCase)
        private readonly _verifyInviteCodeUseCase: IVerifyInviteCodeUseCase,
        @inject(USECASE_TOKENS.IGetWorkspaceMembersUseCase)
        private readonly _getWorkspaceMembersUseCase: IGetWorkspaceMembersUseCase,
        @inject(USECASE_TOKENS.IHandleJoinRequestUseCase)
        private readonly _handleJoinRequestUseCase: IHandleJoinRequestUseCase,
        @inject(USECASE_TOKENS.IRemoveWorkspaceMemberUseCase)
        private readonly _removeWorkspaceMemberUseCase: IRemoveWorkspaceMemberUseCase,
        @inject(USECASE_TOKENS.IBlockWorkspaceMemberUseCase)
        private readonly _blockWorkspaceMemberUseCase: IBlockWorkspaceMemberUseCase,
        @inject(USECASE_TOKENS.IUnblockWorkspaceMemberUseCase)
        private readonly _unblockWorkspaceMemberUseCase: IUnblockWorkspaceMemberUseCase,
        @inject(USECASE_TOKENS.IUpdateWorkspaceUseCase)
        private readonly _updateWorkspaceUseCase: IUpdateWorkspaceUseCase,
        @inject(USECASE_TOKENS.IRegenerateInviteCodeUseCase)
        private readonly _regenerateInviteCodeUseCase: IRegenerateInviteCodeUseCase,
        @inject(USECASE_TOKENS.IDeleteWorkspaceUseCase)
        private readonly _deleteWorkspaceUseCase: IDeleteWorkspaceUseCase,
        @inject(USECASE_TOKENS.ISendWorkspaceInviteUseCase)
        private readonly _sendWorkspaceInviteUseCase: ISendWorkspaceInviteUseCase
    ) {}

    create = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspace = await this._createWorkspaceUseCase.execute({
            ...req.body,
            createdBy: userId,
        });
        res.status(HttpStatusCode.CREATED).json(
            ApiResponse.success(SuccessMessage.WORKSPACE_CREATED, workspace)
        );
    });

    join = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const { inviteCode, isFromEmailLink } = req.body;
        const member = await this._joinWorkspaceUseCase.execute({
            inviteCode,
            userId,
            isFromEmailLink,
        });
        const successMessage =
            member.status === "pending"
                ? SuccessMessage.WORKSPACE_JOIN_REQUESTED
                : member.status === "invited"
                  ? SuccessMessage.WORKSPACE_INVITE_PENDING_ACCEPT
                  : SuccessMessage.WORKSPACE_JOINED;
        res.status(HttpStatusCode.CREATED).json(
            ApiResponse.success(successMessage, member)
        );
    });

    getUserWorkspaces = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaces = await this._getUserWorkspacesUseCase.execute({ userId });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.USER_WORKSPACES_FETCHED, workspaces)
        );
    });

    getPublicWorkspaces = catchAsync(async (_req: AuthenticatedRequest, res: Response) => {
        const workspaces = await this._getPublicWorkspacesUseCase.execute();
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.PUBLIC_WORKSPACES_FETCHED, workspaces)
        );
    });

    verifyInviteCode = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const { code } = req.params;
        const workspace = await this._verifyInviteCodeUseCase.execute({
            inviteCode: code as string,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.WORKSPACE_VERIFIED, workspace)
        );
    });

    getWorkspaceMembers = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaceId = req.params.id as string;
        const includeProfile = Boolean(req.query.includeProfile);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const search = req.query.search as string;
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder as "asc" | "desc";
        const members = await this._getWorkspaceMembersUseCase.execute({
            workspaceId,
            requestUserId: userId,
            includeProfile,
            params: { page, limit, search, sortBy, sortOrder },
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.WORKSPACE_MEMBERS_FETCHED, members)
        );
    });

    handleJoinRequest = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaceId = req.params.id as string;
        const { action, targetUserId } = req.body;
        const result = await this._handleJoinRequestUseCase.execute({
            workspaceId,
            requestUserId: userId,
            action,
            targetUserId,
        });
        const successMessage =
            action === "approve"
                ? SuccessMessage.JOIN_REQUEST_APPROVED
                : SuccessMessage.JOIN_REQUEST_REJECTED;
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(successMessage, result)
        );
    });

    removeMember = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaceId = req.params.id as string;
        const targetUserId = req.params.userId as string;
        await this._removeWorkspaceMemberUseCase.execute({
            workspaceId,
            requesterId: userId,
            targetUserId,
        });
        const io = SocketService.getInstance()?.getIO();
        if (io) {
            io.to(`workspace:${workspaceId}`).emit("workspace_member_removed", {
                userId: targetUserId,
                workspaceId,
                removedBy: userId,
            });
        }
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.MEMBER_REMOVED)
        );
    });

    blockMember = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaceId = req.params.id as string;
        const targetUserId = req.params.userId as string;
        await this._blockWorkspaceMemberUseCase.execute({
            workspaceId,
            ownerId: userId,
            targetUserId,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.MEMBER_BLOCKED)
        );
    });

    unblockMember = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaceId = req.params.id as string;
        const targetUserId = req.params.userId as string;
        await this._unblockWorkspaceMemberUseCase.execute({
            workspaceId,
            ownerId: userId,
            targetUserId,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.MEMBER_UNBLOCKED)
        );
    });

    update = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaceId = req.params.id as string;
        const workspace = await this._updateWorkspaceUseCase.execute({
            workspaceId,
            ownerId: userId,
            data: req.body,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.WORKSPACE_UPDATED, workspace)
        );
    });

    regenerateInviteCode = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaceId = req.params.id as string;
        const workspace = await this._regenerateInviteCodeUseCase.execute({
            workspaceId,
            ownerId: userId,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.INVITE_CODE_REGENERATED, workspace)
        );
    });

    delete = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaceId = req.params.id as string;
        await this._deleteWorkspaceUseCase.execute({ workspaceId, ownerId: userId });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.WORKSPACE_DELETED)
        );
    });

    sendInviteEmail = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaceId = req.params.id as string;
        const { targetEmail } = req.body;
        const result = await this._sendWorkspaceInviteUseCase.execute({
            workspaceId,
            requesterId: userId,
            targetEmail,
        });
        res.status(HttpStatusCode.OK).json(ApiResponse.success(result.message));
    });
}
