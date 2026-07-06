import { injectable, inject } from 'tsyringe';
import { Response, NextFunction } from "express";
import { CreateWorkspaceUseCase } from "../../application/use-cases/workspace/create-workspace.usecase";
import { JoinWorkspaceUseCase } from "../../application/use-cases/workspace/join-workspace.usecase";
import { GetUserWorkspacesUseCase } from "../../application/use-cases/workspace/get-user-workspaces.usecase";
import { GetPublicWorkspacesUseCase } from "../../application/use-cases/workspace/get-public-workspaces.usecase";
import { VerifyInviteCodeUseCase } from "../../application/use-cases/workspace/verify-invite-code.usecase";
import { GetWorkspaceMembersUseCase } from "../../application/use-cases/workspace/get-workspace-members.usecase";
import { HandleJoinRequestUseCase } from "../../application/use-cases/workspace/handle-join-request.usecase";
import { RemoveWorkspaceMemberUseCase } from "../../application/use-cases/workspace/remove-workspace-member.usecase";
import { BlockWorkspaceMemberUseCase } from "../../application/use-cases/workspace/block-workspace-member.usecase";
import { UnblockWorkspaceMemberUseCase } from "../../application/use-cases/workspace/unblock-workspace-member.usecase";
import { UpdateWorkspaceUseCase } from "../../application/use-cases/workspace/update-workspace.usecase";
import { RegenerateInviteCodeUseCase } from "../../application/use-cases/workspace/regenerate-invite-code.usecase";
import { DeleteWorkspaceUseCase } from "../../application/use-cases/workspace/delete-workspace.usecase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { AppError } from "../../domain/errors/AppError";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { SocketService } from "../../infrastructure/socket/socket.service";

import { SendWorkspaceInviteUseCase } from "../../application/use-cases/workspace/send-workspace-invite.usecase";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class WorkspaceController {
    constructor(
        @inject(CreateWorkspaceUseCase) private readonly _createWorkspaceUseCase: CreateWorkspaceUseCase,
        @inject(JoinWorkspaceUseCase) private readonly _joinWorkspaceUseCase: JoinWorkspaceUseCase,
        @inject(GetUserWorkspacesUseCase) private readonly _getUserWorkspacesUseCase: GetUserWorkspacesUseCase,
        @inject(GetPublicWorkspacesUseCase) private readonly _getPublicWorkspacesUseCase: GetPublicWorkspacesUseCase,
        @inject(VerifyInviteCodeUseCase) private readonly _verifyInviteCodeUseCase: VerifyInviteCodeUseCase,
        @inject(GetWorkspaceMembersUseCase) private readonly _getWorkspaceMembersUseCase: GetWorkspaceMembersUseCase,
        @inject(HandleJoinRequestUseCase) private readonly _handleJoinRequestUseCase: HandleJoinRequestUseCase,
        @inject(RemoveWorkspaceMemberUseCase) private readonly _removeWorkspaceMemberUseCase: RemoveWorkspaceMemberUseCase,
        @inject(BlockWorkspaceMemberUseCase) private readonly _blockWorkspaceMemberUseCase: BlockWorkspaceMemberUseCase,
        @inject(UnblockWorkspaceMemberUseCase) private readonly _unblockWorkspaceMemberUseCase: UnblockWorkspaceMemberUseCase,
        @inject(UpdateWorkspaceUseCase) private readonly _updateWorkspaceUseCase: UpdateWorkspaceUseCase,
        @inject(RegenerateInviteCodeUseCase) private readonly _regenerateInviteCodeUseCase: RegenerateInviteCodeUseCase,
        @inject(DeleteWorkspaceUseCase) private readonly _deleteWorkspaceUseCase: DeleteWorkspaceUseCase,
        @inject(SendWorkspaceInviteUseCase) private readonly _sendWorkspaceInviteUseCase: SendWorkspaceInviteUseCase
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
        const workspaces = await this._getPublicWorkspacesUseCase.execute({});
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
        const limit = parseInt(req.query.limit as string) || 10;
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
