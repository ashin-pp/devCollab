import { NextFunction, Response } from "express";
import { inject, injectable } from 'tsyringe';
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { AppError } from "../../domain/errors/AppError";
import { SocketService } from "../../infrastructure/socket/socket.service";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

// Import removed, as workspace.controller shouldn't use the admin use case
import type { IGetWorkspaceMembersUseCase } from "../../application/interfaces/use-cases/workspace/get-workspace-members.usecase.interface";
import type { IBlockWorkspaceMemberUseCase } from "../../application/interfaces/use-cases/workspace/block-workspace-member.usecase.interface";
import type { ICreateWorkspaceUseCase } from "../../application/interfaces/use-cases/workspace/create-workspace.usecase.interface";
import type { IDeleteWorkspaceUseCase } from "../../application/interfaces/use-cases/workspace/delete-workspace.usecase.interface";
import type { IGetPublicWorkspacesUseCase } from "../../application/interfaces/use-cases/workspace/get-public-workspaces.usecase.interface";
import type { IGetUserWorkspacesUseCase } from "../../application/interfaces/use-cases/workspace/get-user-workspaces.usecase.interface";
import type { IHandleJoinRequestUseCase } from "../../application/interfaces/use-cases/workspace/handle-join-request.usecase.interface";
import type { IJoinWorkspaceUseCase } from "../../application/interfaces/use-cases/workspace/join-workspace.usecase.interface";
import type { IRegenerateInviteCodeUseCase } from "../../application/interfaces/use-cases/workspace/regenerate-invite-code.usecase.interface";
import type { IRemoveWorkspaceMemberUseCase } from "../../application/interfaces/use-cases/workspace/remove-workspace-member.usecase.interface";
import type { ISendWorkspaceInviteUseCase } from "../../application/interfaces/use-cases/workspace/send-workspace-invite.usecase.interface";
import type { IUnblockWorkspaceMemberUseCase } from "../../application/interfaces/use-cases/workspace/unblock-workspace-member.usecase.interface";
import type { IUpdateWorkspaceUseCase } from "../../application/interfaces/use-cases/workspace/update-workspace.usecase.interface";
import type { IVerifyInviteCodeUseCase } from "../../application/interfaces/use-cases/workspace/verify-invite-code.usecase.interface";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class WorkspaceController {
    constructor(
        @inject(USECASE_TOKENS.ICreateWorkspaceUseCase) private readonly _createWorkspaceUseCase: ICreateWorkspaceUseCase,
        @inject(USECASE_TOKENS.IJoinWorkspaceUseCase) private readonly _joinWorkspaceUseCase: IJoinWorkspaceUseCase,
        @inject(USECASE_TOKENS.IGetUserWorkspacesUseCase) private readonly _getUserWorkspacesUseCase: IGetUserWorkspacesUseCase,
        @inject(USECASE_TOKENS.IGetPublicWorkspacesUseCase) private readonly _getPublicWorkspacesUseCase: IGetPublicWorkspacesUseCase,
        @inject(USECASE_TOKENS.IVerifyInviteCodeUseCase) private readonly _verifyInviteCodeUseCase: IVerifyInviteCodeUseCase,
        @inject(USECASE_TOKENS.IGetWorkspaceMembersUseCase) private readonly _getWorkspaceMembersUseCase: IGetWorkspaceMembersUseCase,
        @inject(USECASE_TOKENS.IHandleJoinRequestUseCase) private readonly _handleJoinRequestUseCase: IHandleJoinRequestUseCase,
        @inject(USECASE_TOKENS.IRemoveWorkspaceMemberUseCase) private readonly _removeWorkspaceMemberUseCase: IRemoveWorkspaceMemberUseCase,
        @inject(USECASE_TOKENS.IBlockWorkspaceMemberUseCase) private readonly _blockWorkspaceMemberUseCase: IBlockWorkspaceMemberUseCase,
        @inject(USECASE_TOKENS.IUnblockWorkspaceMemberUseCase) private readonly _unblockWorkspaceMemberUseCase: IUnblockWorkspaceMemberUseCase,
        @inject(USECASE_TOKENS.IUpdateWorkspaceUseCase) private readonly _updateWorkspaceUseCase: IUpdateWorkspaceUseCase,
        @inject(USECASE_TOKENS.IRegenerateInviteCodeUseCase) private readonly _regenerateInviteCodeUseCase: IRegenerateInviteCodeUseCase,
        @inject(USECASE_TOKENS.IDeleteWorkspaceUseCase) private readonly _deleteWorkspaceUseCase: IDeleteWorkspaceUseCase,
        @inject(USECASE_TOKENS.ISendWorkspaceInviteUseCase) private readonly _sendWorkspaceInviteUseCase: ISendWorkspaceInviteUseCase
    ) {}

    public create = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const workspaceData = {
                        ...req.body,
                        createdBy: userId
                    };
        const workspace = await this._createWorkspaceUseCase.execute(workspaceData);
        const response = ApiResponse.success(SuccessMessage.WORKSPACE_CREATED, workspace);
        res.status(HttpStatusCode.CREATED).json(response);
        });

    public join = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const { inviteCode, isFromEmailLink } = req.body;
        const joinData = {
                        inviteCode,
                        userId,
                        isFromEmailLink
                    };
        const member = await this._joinWorkspaceUseCase.execute(joinData);
        const successMessage = member.status === 'pending'
                        ? SuccessMessage.WORKSPACE_JOIN_REQUESTED
                        : member.status === 'invited'
                            ? SuccessMessage.WORKSPACE_INVITE_PENDING_ACCEPT
                            : SuccessMessage.WORKSPACE_JOINED;
        const response = ApiResponse.success(successMessage, member);
        res.status(HttpStatusCode.CREATED).json(response);
        });

    public getUserWorkspaces = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const workspaces = await this._getUserWorkspacesUseCase.execute({ userId });
        const response = ApiResponse.success("User workspaces retrieved successfully", workspaces);
        res.status(HttpStatusCode.OK).json(response);
        });

    public getPublicWorkspaces = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const workspaces = await this._getPublicWorkspacesUseCase.execute();
        const response = ApiResponse.success("Public workspaces retrieved successfully", workspaces);
        res.status(HttpStatusCode.OK).json(response);
        });

    public verifyInviteCode = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { code } = req.params;
        const workspace = await this._verifyInviteCodeUseCase.execute({ inviteCode: code as string });
        const response = ApiResponse.success("Workspace verified successfully", workspace);
        res.status(HttpStatusCode.OK).json(response);
        });

    public getWorkspaceMembers = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const workspaceId = req.params.id as string;
        const includeProfile = req.query.includeProfile === 'true';
        
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const search = req.query.search as string;
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc';
        
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const members = await this._getWorkspaceMembersUseCase.execute({workspaceId, requestUserId: userId, includeProfile, params: { page, limit, search, sortBy, sortOrder }});
        const response = ApiResponse.success(SuccessMessage.WORKSPACE_MEMBERS_FETCHED, members);
        res.status(HttpStatusCode.OK).json(response);
        });

    public handleJoinRequest = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const workspaceId = req.params.id as string;
        const { action, targetUserId } = req.body;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const result = await this._handleJoinRequestUseCase.execute({workspaceId, requestUserId: userId, action, targetUserId});
        const response = ApiResponse.success(`Join request ${action}ed successfully`, result);
        res.status(HttpStatusCode.OK).json(response);
        });

    public removeMember = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const workspaceId = req.params.id as string;
        const targetUserId = req.params.userId as string;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        await this._removeWorkspaceMemberUseCase.execute({workspaceId, requesterId: userId, targetUserId});
        const io = SocketService.getInstance()?.getIO();
        if (io) {
                        io.to(`workspace:${workspaceId}`).emit('workspace_member_removed', {
                            userId: targetUserId,
                            workspaceId: workspaceId,
                            removedBy: userId
                        });
                    }
        const response = ApiResponse.success("Member removed successfully");
        res.status(HttpStatusCode.OK).json(response);
        });

    public blockMember = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const workspaceId = req.params.id as string;
        const targetUserId = req.params.userId as string;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        await this._blockWorkspaceMemberUseCase.execute({workspaceId, ownerId: userId, targetUserId});
        const response = ApiResponse.success("Member blocked successfully");
        res.status(HttpStatusCode.OK).json(response);
        });

    public unblockMember = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const workspaceId = req.params.id as string;
        const targetUserId = req.params.userId as string;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        await this._unblockWorkspaceMemberUseCase.execute({workspaceId, ownerId: userId, targetUserId});
        const response = ApiResponse.success("Member unblocked successfully");
        res.status(HttpStatusCode.OK).json(response);
        });

    public update = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const workspaceId = req.params.id as string;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const workspace = await this._updateWorkspaceUseCase.execute({workspaceId, ownerId: userId, data: req.body});
        const response = ApiResponse.success("Workspace updated successfully", workspace);
        res.status(HttpStatusCode.OK).json(response);
        });

    public regenerateInviteCode = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const workspaceId = req.params.id as string;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const workspace = await this._regenerateInviteCodeUseCase.execute({workspaceId, ownerId: userId});
        const response = ApiResponse.success("Invite code regenerated successfully", workspace);
        res.status(HttpStatusCode.OK).json(response);
        });

    public delete = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const workspaceId = req.params.id as string;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        await this._deleteWorkspaceUseCase.execute({workspaceId, ownerId: userId});
        const response = ApiResponse.success("Workspace deleted successfully");
        res.status(HttpStatusCode.OK).json(response);
        });

    public sendInviteEmail = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const workspaceId = req.params.id as string;
        const { targetEmail } = req.body;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const result = await this._sendWorkspaceInviteUseCase.execute({workspaceId, requesterId: userId, targetEmail});
        const response = ApiResponse.success(result.message);
        res.status(HttpStatusCode.OK).json(response);
        });
}
