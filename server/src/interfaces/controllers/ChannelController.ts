import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { SocketService } from '../../infra/socket/SocketService';
import { CreateChannelUseCase } from '../../application/use-cases/channel/CreateChannelUseCase';
import { GetWorkspaceChannelsUseCase } from '../../application/use-cases/channel/GetWorkspaceChannelsUseCase';
import { GetChannelMembersUseCase } from '../../application/use-cases/channel/GetChannelMembersUseCase';
import { AddChannelMemberUseCase } from '../../application/use-cases/channel/AddChannelMemberUseCase';
import { RemoveChannelMemberUseCase } from "../../application/use-cases/channel/RemoveChannelMemberUseCase";
import { BlockChannelMemberUseCase } from "../../application/use-cases/channel/BlockChannelMemberUseCase";
import { GetBlockedChannelMembersUseCase } from "../../application/use-cases/channel/GetBlockedChannelMembersUseCase";
import { UnblockChannelMemberUseCase } from "../../application/use-cases/channel/UnblockChannelMemberUseCase";
import { UpdateChannelUseCase } from '../../application/use-cases/channel/UpdateChannelUseCase';
import { LeaveChannelUseCase } from '../../application/use-cases/channel/LeaveChannelUseCase';
import { DeleteChannelUseCase } from '../../application/use-cases/channel/DeleteChannelUseCase';
import { JoinChannelUseCase } from '../../application/use-cases/channel/JoinChannelUseCase';
import { GetChannelRequestsUseCase } from '../../application/use-cases/channel/GetChannelRequestsUseCase';
import { UpdateChannelRequestUseCase } from '../../application/use-cases/channel/UpdateChannelRequestUseCase';
import { MarkChannelAsReadUseCase } from '../../application/use-cases/channel/MarkChannelAsReadUseCase';
import { GetUnreadCountsUseCase } from '../../application/use-cases/channel/GetUnreadCountsUseCase';
import { IMessageRepository } from '../../application/repositories/IMessageRepository';
import { Message } from '../../domain/entities/Message';
import { HttpStatusCode } from '../../domain/enums/HttpStatusCode';
import { AppError } from '../../domain/errors/AppError';
import { ErrorMessage } from '../../domain/enums/ErrorMessage';

export class ChannelController {
    constructor(
        private readonly createChannelUseCase: CreateChannelUseCase,
        private readonly getWorkspaceChannelsUseCase: GetWorkspaceChannelsUseCase,
        private getChannelMembersUseCase: GetChannelMembersUseCase,
        private addChannelMemberUseCase: AddChannelMemberUseCase,
        private removeChannelMemberUseCase: RemoveChannelMemberUseCase,
        private blockChannelMemberUseCase: BlockChannelMemberUseCase,
        private getBlockedChannelMembersUseCase: GetBlockedChannelMembersUseCase,
        private unblockChannelMemberUseCase: UnblockChannelMemberUseCase,
        private updateChannelUseCase: UpdateChannelUseCase,
        private readonly leaveChannelUseCase: LeaveChannelUseCase,
        private readonly deleteChannelUseCase: DeleteChannelUseCase,
        private readonly joinChannelUseCase: JoinChannelUseCase,
        private readonly getChannelRequestsUseCase: GetChannelRequestsUseCase,
        private readonly updateChannelRequestUseCase: UpdateChannelRequestUseCase,
        private readonly markChannelAsReadUseCase: MarkChannelAsReadUseCase,
        private readonly getUnreadCountsUseCase: GetUnreadCountsUseCase,
        private readonly messageRepository: IMessageRepository
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

            const addedMembersData = await this.addChannelMemberUseCase.execute(workspaceId as string, channelId as string, userIds, userId);
            
            // For each added member, emit a system message
            const io = SocketService.getInstance()?.getIO();
            if (io && addedMembersData.length > 0) {
                for (const data of addedMembersData) {
                    const systemContent = `${data.userName} was added to the channel`;
                    const sysMessage = new Message(workspaceId as string, channelId as string, userId, systemContent, 'system');
                    const savedMsg = await this.messageRepository.create(sysMessage);
                    io.to(`channel:${channelId}`).emit('message_received', savedMsg);
                }
            }

            // Extract just the member data for the response
            const addedMembers = addedMembersData.map(data => data.member);

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

            const details = await this.removeChannelMemberUseCase.execute(workspaceId as string, channelId as string, memberId as string, userId);
            
            // Persist system message
            const systemContent = `${details.userName} was removed from the channel by ${details.removedBy}`;
            const sysMessage = new Message(workspaceId as string, channelId as string, userId, systemContent, 'system');
            const savedMsg = await this.messageRepository.create(sysMessage);

            // Emit socket event
            const io = SocketService.getInstance()?.getIO();
            if (io) {
                // Also emit new message for system message
                io.to(`channel:${channelId}`).emit('message_received', savedMsg);
                
                io.to(`channel:${channelId}`).emit('member_removed', {
                    userId: details.userId,
                    userName: details.userName,
                    removedBy: details.removedBy
                });
            }

            res.status(HttpStatusCode.OK).json({
                message: "Member removed successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    blockChannelMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId, channelId, memberId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const details = await this.blockChannelMemberUseCase.execute(workspaceId as string, channelId as string, memberId as string, userId);
            
            // Persist system message
            const systemContent = `${details.userName} was blocked by ${details.removedBy}`;
            const sysMessage = new Message(workspaceId as string, channelId as string, userId, systemContent, 'system');
            const savedMsg = await this.messageRepository.create(sysMessage);

            // Emit socket event
            const io = SocketService.getInstance()?.getIO();
            if (io) {
                // Also emit new message for system message
                io.to(`channel:${channelId}`).emit('message_received', savedMsg);

                io.to(`channel:${channelId}`).emit('member_removed', {
                    userId: details.userId,
                    userName: details.userName,
                    removedBy: details.removedBy
                });
            }

            res.status(HttpStatusCode.OK).json({
                message: "Member blocked successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    getBlockedChannelMembers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId, channelId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const blockedMembers = await this.getBlockedChannelMembersUseCase.execute(workspaceId as string, channelId as string, userId);
            
            res.status(HttpStatusCode.OK).json({
                success: true,
                data: blockedMembers
            });
        } catch (error) {
            next(error);
        }
    };

    unblockChannelMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId, channelId, memberId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            await this.unblockChannelMemberUseCase.execute(workspaceId as string, channelId as string, memberId as string, userId);
            
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Member unblocked successfully"
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
            
            // Emit socket event when someone joins
            if (result.status === 'approved') {
                const io = SocketService.getInstance()?.getIO();
                if (io) {
                    const systemContent = `${result.userName} joined the channel`;
                    const sysMessage = new Message(workspaceId as string, channelId as string, userId, systemContent, 'system');
                    const savedMsg = await this.messageRepository.create(sysMessage);
                    io.to(`channel:${channelId}`).emit('message_received', savedMsg);
                }
            }

            res.status(HttpStatusCode.OK).json({
                message: result.message,
                status: result.status
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

    markChannelAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { channelId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const result = await this.markChannelAsReadUseCase.execute(channelId as string, userId);
            
            res.status(result.statusCode).json({
                success: result.success,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    };

    getUnreadCounts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const result = await this.getUnreadCountsUseCase.execute(workspaceId as string, userId);
            
            res.status(result.statusCode).json({
                success: result.success,
                data: result.data
            });
        } catch (error) {
            next(error);
        }
    };
}
