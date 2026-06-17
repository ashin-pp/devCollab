import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { CreateChannelUseCase } from '../../application/use-cases/channel/CreateChannelUseCase';
import { GetWorkspaceChannelsUseCase } from '../../application/use-cases/channel/GetWorkspaceChannelsUseCase';
import { GetChannelMembersUseCase } from '../../application/use-cases/channel/GetChannelMembersUseCase';
import { AddChannelMemberUseCase } from '../../application/use-cases/channel/AddChannelMemberUseCase';
import { RemoveChannelMemberUseCase } from '../../application/use-cases/channel/RemoveChannelMemberUseCase';
import { UpdateChannelUseCase } from '../../application/use-cases/channel/UpdateChannelUseCase';
import { LeaveChannelUseCase } from '../../application/use-cases/channel/LeaveChannelUseCase';
import { DeleteChannelUseCase } from '../../application/use-cases/channel/DeleteChannelUseCase';
import { JoinChannelUseCase } from '../../application/use-cases/channel/JoinChannelUseCase';
import { GetChannelRequestsUseCase } from '../../application/use-cases/channel/GetChannelRequestsUseCase';
import { UpdateChannelRequestUseCase } from '../../application/use-cases/channel/UpdateChannelRequestUseCase';
import { HttpStatusCode } from '../../domain/enums/HttpStatusCode';
import { AppError } from '../../domain/errors/AppError';
import { ErrorMessage } from '../../domain/enums/ErrorMessage';

export class ChannelController {
    constructor(
        private createChannelUseCase: CreateChannelUseCase,
        private getWorkspaceChannelsUseCase: GetWorkspaceChannelsUseCase,
        private getChannelMembersUseCase: GetChannelMembersUseCase,
        private addChannelMemberUseCase: AddChannelMemberUseCase,
        private removeChannelMemberUseCase: RemoveChannelMemberUseCase,
        private updateChannelUseCase: UpdateChannelUseCase,
        private leaveChannelUseCase: LeaveChannelUseCase,
        private deleteChannelUseCase: DeleteChannelUseCase,
        private joinChannelUseCase: JoinChannelUseCase,
        private getChannelRequestsUseCase: GetChannelRequestsUseCase,
        private updateChannelRequestUseCase: UpdateChannelRequestUseCase
    ) {}

    createChannel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId } = req.params;
            const { name, description, privacy } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            if (!name) {
                throw new AppError("Channel name is required", HttpStatusCode.BAD_REQUEST);
            }

            const channel = await this.createChannelUseCase.execute(workspaceId as string, name, description, userId, privacy || 'public');
            
            res.status(HttpStatusCode.CREATED).json({
                message: "Channel created successfully",
                data: channel
            });
        } catch (error) {
            next(error);
        }
    };

    getWorkspaceChannels = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const channels = await this.getWorkspaceChannelsUseCase.execute(workspaceId as string, userId);
            
            res.status(HttpStatusCode.OK).json({
                message: "Channels fetched successfully",
                data: channels
            });
        } catch (error) {
            next(error);
        }
    };

    getChannelMembers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId, channelId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const members = await this.getChannelMembersUseCase.execute(workspaceId as string, channelId as string, userId);
            
            res.status(HttpStatusCode.OK).json({
                message: "Channel members fetched successfully",
                data: members
            });
        } catch (error) {
            next(error);
        }
    };

    addChannelMembers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId, channelId } = req.params;
            const { userIds } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const addedMembers = await this.addChannelMemberUseCase.execute(workspaceId as string, channelId as string, userIds, userId);
            
            res.status(HttpStatusCode.CREATED).json({
                message: "Members added successfully",
                data: addedMembers
            });
        } catch (error) {
            next(error);
        }
    };

    removeChannelMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId, channelId, memberId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            await this.removeChannelMemberUseCase.execute(workspaceId as string, channelId as string, memberId as string, userId);
            
            res.status(HttpStatusCode.OK).json({
                message: "Member removed successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    updateChannel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId, channelId } = req.params;
            const updateData = req.body;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const updatedChannel = await this.updateChannelUseCase.execute(workspaceId as string, channelId as string, userId, updateData);
            
            res.status(HttpStatusCode.OK).json({
                message: "Channel updated successfully",
                data: updatedChannel
            });
        } catch (error) {
            next(error);
        }
    };

    leaveChannel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId, channelId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            await this.leaveChannelUseCase.execute(workspaceId as string, channelId as string, userId);
            
            res.status(HttpStatusCode.OK).json({
                message: "Left channel successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    deleteChannel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId, channelId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            await this.deleteChannelUseCase.execute(workspaceId as string, channelId as string, userId);
            
            res.status(HttpStatusCode.OK).json({
                message: "Channel deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    joinChannel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId, channelId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const result = await this.joinChannelUseCase.execute(workspaceId as string, channelId as string, userId);
            
            res.status(HttpStatusCode.OK).json({
                ...result
            });
        } catch (error) {
            next(error);
        }
    };

    getChannelRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { channelId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const requests = await this.getChannelRequestsUseCase.execute(channelId as string);
            
            res.status(HttpStatusCode.OK).json({
                success: true,
                data: requests
            });
        } catch (error) {
            next(error);
        }
    };

    updateChannelRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId, channelId, userId: targetUserId } = req.params;
            const { action } = req.body;
            const adminId = req.user?.id;

            if (!adminId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const result = await this.updateChannelRequestUseCase.execute(workspaceId as string, channelId as string, targetUserId as string, action, adminId);
            
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            next(error);
        }
    };
}
