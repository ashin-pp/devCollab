import { Response, NextFunction } from "express";
import { CreateWorkspaceUseCase } from "../../application/use-cases/workspace/CreateWorkspaceUseCase";
import { JoinWorkspaceUseCase } from "../../application/use-cases/workspace/JoinWorkspaceUseCase";
import { GetUserWorkspacesUseCase } from "../../application/use-cases/workspace/GetUserWorkspacesUseCase";
import { GetPublicWorkspacesUseCase } from "../../application/use-cases/workspace/GetPublicWorkspacesUseCase";
import { VerifyInviteCodeUseCase } from "../../application/use-cases/workspace/VerifyInviteCodeUseCase";
import { GetWorkspaceMembersUseCase } from "../../application/use-cases/workspace/GetWorkspaceMembersUseCase";
import { HandleJoinRequestUseCase } from "../../application/use-cases/workspace/HandleJoinRequestUseCase";
import { RemoveWorkspaceMemberUseCase } from "../../application/use-cases/workspace/RemoveWorkspaceMemberUseCase";
import { BlockWorkspaceMemberUseCase } from "../../application/use-cases/workspace/BlockWorkspaceMemberUseCase";
import { UnblockWorkspaceMemberUseCase } from "../../application/use-cases/workspace/UnblockWorkspaceMemberUseCase";
import { UpdateWorkspaceUseCase } from "../../application/use-cases/workspace/UpdateWorkspaceUseCase";
import { RegenerateInviteCodeUseCase } from "../../application/use-cases/workspace/RegenerateInviteCodeUseCase";
import { DeleteWorkspaceUseCase } from "../../application/use-cases/workspace/DeleteWorkspaceUseCase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { AppError } from "../../domain/errors/AppError";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";

import { SendWorkspaceInviteUseCase } from "../../application/use-cases/workspace/SendWorkspaceInviteUseCase";

export class WorkspaceController {
    constructor(
        private readonly createWorkspaceUseCase: CreateWorkspaceUseCase,
        private readonly joinWorkspaceUseCase: JoinWorkspaceUseCase,
        private readonly getUserWorkspacesUseCase: GetUserWorkspacesUseCase,
        private readonly getPublicWorkspacesUseCase: GetPublicWorkspacesUseCase,
        private readonly verifyInviteCodeUseCase: VerifyInviteCodeUseCase,
        private readonly getWorkspaceMembersUseCase: GetWorkspaceMembersUseCase,
        private readonly handleJoinRequestUseCase: HandleJoinRequestUseCase,
        private readonly removeWorkspaceMemberUseCase: RemoveWorkspaceMemberUseCase,
        private readonly blockWorkspaceMemberUseCase: BlockWorkspaceMemberUseCase,
        private readonly unblockWorkspaceMemberUseCase: UnblockWorkspaceMemberUseCase,
        private readonly updateWorkspaceUseCase: UpdateWorkspaceUseCase,
        private readonly regenerateInviteCodeUseCase: RegenerateInviteCodeUseCase,
        private readonly deleteWorkspaceUseCase: DeleteWorkspaceUseCase,
        private readonly sendWorkspaceInviteUseCase: SendWorkspaceInviteUseCase
    ) {}

    public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const workspaceData = {
                ...req.body,
                createdBy: userId
            };
            
            const workspace = await this.createWorkspaceUseCase.execute(workspaceData);
            const response = ApiResponse.success(SuccessMessage.WORKSPACE_CREATED, workspace);
            
            res.status(HttpStatusCode.CREATED).json(response);
        } catch (error) {
            next(error);
        }
    };

    public join = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const { inviteCode } = req.body;
            
            const joinData = {
                inviteCode,
                userId
            };

            const member = await this.joinWorkspaceUseCase.execute(joinData);
            const successMessage = member.status === 'pending' 
                ? SuccessMessage.WORKSPACE_JOIN_REQUESTED
                : SuccessMessage.WORKSPACE_JOINED;
            const response = ApiResponse.success(successMessage, member);
            
            res.status(HttpStatusCode.CREATED).json(response);
        } catch (error) {
            next(error);
        }
    };

    public getUserWorkspaces = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const workspaces = await this.getUserWorkspacesUseCase.execute(userId);
            const response = ApiResponse.success("User workspaces retrieved successfully", workspaces);
            
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public getPublicWorkspaces = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const workspaces = await this.getPublicWorkspacesUseCase.execute();
            const response = ApiResponse.success("Public workspaces retrieved successfully", workspaces);
            
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public verifyInviteCode = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { code } = req.params;
            const workspace = await this.verifyInviteCodeUseCase.execute(code as string);
            const response = ApiResponse.success("Workspace verified successfully", workspace);
            
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public getWorkspaceMembers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const workspaceId = req.params.id as string;
            const includeProfile = req.query.includeProfile === 'true';
            
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const members = await this.getWorkspaceMembersUseCase.execute(workspaceId, userId, includeProfile);
            const response = ApiResponse.success(SuccessMessage.WORKSPACE_MEMBERS_FETCHED, members);
            
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public handleJoinRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const workspaceId = req.params.id as string;
            const { action, targetUserId } = req.body;
            
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const result = await this.handleJoinRequestUseCase.execute(workspaceId, userId, action, targetUserId);
            const response = ApiResponse.success(`Join request ${action}ed successfully`, result);
            
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public removeMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const workspaceId = req.params.id as string;
            const targetUserId = req.params.userId as string;
            
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            await this.removeWorkspaceMemberUseCase.execute(workspaceId, userId, targetUserId);
            const response = ApiResponse.success("Member removed successfully");
            
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public blockMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const workspaceId = req.params.id as string;
            const targetUserId = req.params.userId as string;
            
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            await this.blockWorkspaceMemberUseCase.execute(workspaceId, userId, targetUserId);
            const response = ApiResponse.success("Member blocked successfully");
            
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public unblockMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const workspaceId = req.params.id as string;
            const targetUserId = req.params.userId as string;
            
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            await this.unblockWorkspaceMemberUseCase.execute(workspaceId, userId, targetUserId);
            const response = ApiResponse.success("Member unblocked successfully");
            
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const workspaceId = req.params.id as string;
            
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const workspace = await this.updateWorkspaceUseCase.execute(workspaceId, userId, req.body);
            const response = ApiResponse.success("Workspace updated successfully", workspace);
            
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public regenerateInviteCode = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const workspaceId = req.params.id as string;
            
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const workspace = await this.regenerateInviteCodeUseCase.execute(workspaceId, userId);
            const response = ApiResponse.success("Invite code regenerated successfully", workspace);
            
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const workspaceId = req.params.id as string;
            
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            await this.deleteWorkspaceUseCase.execute(workspaceId, userId);
            const response = ApiResponse.success("Workspace deleted successfully");
            
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public sendInviteEmail = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const workspaceId = req.params.id as string;
            const { targetEmail } = req.body;
            
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const result = await this.sendWorkspaceInviteUseCase.execute(workspaceId, userId, targetEmail);
            const response = ApiResponse.success(result.message);
            
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };
}
