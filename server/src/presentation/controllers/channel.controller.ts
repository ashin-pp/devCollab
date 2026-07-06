import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../infrastructure/di/tokens';
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { SocketService } from "../../infrastructure/socket/socket.service";
import { CreateChannelUseCase } from "../../application/use-cases/channel/create-channel.usecase";
import { GetWorkspaceChannelsUseCase } from "../../application/use-cases/channel/get-workspace-channels.usecase";
import { GetChannelMembersUseCase } from "../../application/use-cases/channel/get-channel-members.usecase";
import { AddChannelMemberUseCase } from "../../application/use-cases/channel/add-channel-member.usecase";
import { RemoveChannelMemberUseCase } from "../../application/use-cases/channel/remove-channel-member.usecase";
import { BlockChannelMemberUseCase } from "../../application/use-cases/channel/block-channel-member.usecase";
import { GetBlockedChannelMembersUseCase } from "../../application/use-cases/channel/get-blocked-channel-members.usecase";
import { UnblockChannelMemberUseCase } from "../../application/use-cases/channel/unblock-channel-member.usecase";
import { UpdateChannelUseCase } from "../../application/use-cases/channel/update-channel.usecase";
import { LeaveChannelUseCase } from "../../application/use-cases/channel/leave-channel.usecase";
import { DeleteChannelUseCase } from "../../application/use-cases/channel/delete-channel.usecase";
import { JoinChannelUseCase } from "../../application/use-cases/channel/join-channel.usecase";
import { GetChannelRequestsUseCase } from "../../application/use-cases/channel/get-channel-requests.usecase";
import { UpdateChannelRequestUseCase } from "../../application/use-cases/channel/update-channel-request.usecase";
import { MarkChannelAsReadUseCase } from "../../application/use-cases/channel/mark-channel-as-read.usecase";
import { GetUnreadCountsUseCase } from "../../application/use-cases/channel/get-unread-counts.usecase";
import type { IMessageRepository } from "../../application/interfaces/repositories/message.repository.interface";
import { Message } from "../../domain/entities/message.entity";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AppError } from "../../domain/errors/AppError";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class ChannelController {
    constructor(
        @inject(CreateChannelUseCase) private readonly _createChannelUseCase: CreateChannelUseCase,
        @inject(GetWorkspaceChannelsUseCase) private readonly _getWorkspaceChannelsUseCase: GetWorkspaceChannelsUseCase,
        @inject(GetChannelMembersUseCase) private _getChannelMembersUseCase: GetChannelMembersUseCase,
        @inject(AddChannelMemberUseCase) private _addChannelMemberUseCase: AddChannelMemberUseCase,
        @inject(RemoveChannelMemberUseCase) private _removeChannelMemberUseCase: RemoveChannelMemberUseCase,
        @inject(BlockChannelMemberUseCase) private _blockChannelMemberUseCase: BlockChannelMemberUseCase,
        @inject(GetBlockedChannelMembersUseCase) private _getBlockedChannelMembersUseCase: GetBlockedChannelMembersUseCase,
        @inject(UnblockChannelMemberUseCase) private _unblockChannelMemberUseCase: UnblockChannelMemberUseCase,
        @inject(UpdateChannelUseCase) private _updateChannelUseCase: UpdateChannelUseCase,
        @inject(LeaveChannelUseCase) private readonly _leaveChannelUseCase: LeaveChannelUseCase,
        @inject(DeleteChannelUseCase) private readonly _deleteChannelUseCase: DeleteChannelUseCase,
        @inject(JoinChannelUseCase) private readonly _joinChannelUseCase: JoinChannelUseCase,
        @inject(GetChannelRequestsUseCase) private readonly _getChannelRequestsUseCase: GetChannelRequestsUseCase,
        @inject(UpdateChannelRequestUseCase) private readonly _updateChannelRequestUseCase: UpdateChannelRequestUseCase,
        @inject(MarkChannelAsReadUseCase) private readonly _markChannelAsReadUseCase: MarkChannelAsReadUseCase,
        @inject(GetUnreadCountsUseCase) private readonly _getUnreadCountsUseCase: GetUnreadCountsUseCase,
        @inject(TOKENS.IMessageRepository) private readonly _messageRepository: IMessageRepository
    ) {}

    createChannel = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId } = req.params;
        const { name, description, privacy } = req.body;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        if (!name) {
                        throw new AppError("Channel name is required", HttpStatusCode.BAD_REQUEST);
                    }
        const channel = await this._createChannelUseCase.execute({workspaceId: workspaceId as string, name, description, createdBy: userId, privacy: privacy || 'public'});
        res.status(HttpStatusCode.CREATED).json({
                        message: "Channel created successfully",
                        data: channel
                    });
        });

    getWorkspaceChannels = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const channels = await this._getWorkspaceChannelsUseCase.execute({workspaceId: workspaceId as string, userId});
        res.status(HttpStatusCode.OK).json({
                        message: "Channels fetched successfully",
                        data: channels
                    });
        });

    getChannelMembers = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId, channelId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const members = await this._getChannelMembersUseCase.execute({workspaceId: workspaceId as string, channelId: channelId as string, requestUserId: userId});
        res.status(HttpStatusCode.OK).json({
                        message: "Channel members fetched successfully",
                        data: members
                    });
        });

    addChannelMembers = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId, channelId } = req.params;
        const { userIds } = req.body;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const addedMembersData = await this._addChannelMemberUseCase.execute({workspaceId: workspaceId as string, channelId: channelId as string, userIds, requestUserId: userId});
        const io = SocketService.getInstance()?.getIO();
        if (io && addedMembersData.length > 0) {
                        for (const data of addedMembersData) {
                            const systemContent = `${data.user?.name || 'A user'} was added to the channel`;
                            const sysMessage = new Message(workspaceId as string, channelId as string, userId, systemContent, 'system');
                            const savedMsg = await this._messageRepository.create(sysMessage);
                            io.to(`channel:${channelId}`).emit('message_received', savedMsg);
                        }
                    }
        const addedMembers = addedMembersData;
        res.status(HttpStatusCode.CREATED).json({
                        message: "Members added successfully",
                        data: addedMembers
                    });
        });

    removeChannelMember = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId, channelId, memberId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const details = await this._removeChannelMemberUseCase.execute({workspaceId: workspaceId as string, channelId: channelId as string, targetUserId: memberId as string, requestUserId: userId});
        const systemContent = `${details.userName} was removed from the channel by ${details.removedBy}`;
        const sysMessage = new Message(workspaceId as string, channelId as string, userId, systemContent, 'system');
        const savedMsg = await this._messageRepository.create(sysMessage);
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
        });

    blockChannelMember = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId, channelId, memberId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const details = await this._blockChannelMemberUseCase.execute({workspaceId: workspaceId as string, channelId: channelId as string, memberId: memberId as string, requesterId: userId});
        const systemContent = `${details.userName} was blocked by ${details.removedBy}`;
        const sysMessage = new Message(workspaceId as string, channelId as string, userId, systemContent, 'system');
        const savedMsg = await this._messageRepository.create(sysMessage);
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
        });

    getBlockedChannelMembers = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId, channelId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const blockedMembers = await this._getBlockedChannelMembersUseCase.execute({workspaceId: workspaceId as string, channelId: channelId as string, requestUserId: userId});
        res.status(HttpStatusCode.OK).json({
                        success: true,
                        data: blockedMembers
                    });
        });

    unblockChannelMember = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId, channelId, memberId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        await this._unblockChannelMemberUseCase.execute({workspaceId: workspaceId as string, channelId: channelId as string, memberId: memberId as string, requesterId: userId});
        res.status(HttpStatusCode.OK).json({
                        success: true,
                        message: "Member unblocked successfully"
                    });
        });


    updateChannel = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId, channelId } = req.params;
        const updateData = req.body;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const updatedChannel = await this._updateChannelUseCase.execute({workspaceId: workspaceId as string, channelId: channelId as string, requestUserId: userId, updateData: req.body});
        res.status(HttpStatusCode.OK).json({
                        message: "Channel updated successfully",
                        data: updatedChannel
                    });
        });

    leaveChannel = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId, channelId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        await this._leaveChannelUseCase.execute({workspaceId: workspaceId as string, channelId: channelId as string, requestUserId: userId});
        res.status(HttpStatusCode.OK).json({
                        message: "Left channel successfully"
                    });
        });

    deleteChannel = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId, channelId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        await this._deleteChannelUseCase.execute({workspaceId: workspaceId as string, channelId: channelId as string, requestUserId: userId});
        res.status(HttpStatusCode.OK).json({
                        message: "Channel deleted successfully"
                    });
        });

    joinChannel = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId, channelId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const result = await this._joinChannelUseCase.execute({workspaceId: workspaceId as string, channelId: channelId as string, userId});
        if (result.status === 'approved') {
                        const io = SocketService.getInstance()?.getIO();
                        if (io) {
                            const systemContent = `${result.userName} joined the channel`;
                            const sysMessage = new Message(workspaceId as string, channelId as string, userId, systemContent, 'system');
                            const savedMsg = await this._messageRepository.create(sysMessage);
                            io.to(`channel:${channelId}`).emit('message_received', savedMsg);
                        }
                    }
        res.status(HttpStatusCode.OK).json({
                        message: result.message,
                        status: result.status
                    });
        });

    getChannelRequests = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { channelId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const requests = await this._getChannelRequestsUseCase.execute({channelId: channelId as string});
        res.status(HttpStatusCode.OK).json({
                        success: true,
                        data: requests
                    });
        });

    updateChannelRequest = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId, channelId, userId: targetUserId } = req.params;
        const { action } = req.body;
        const adminId = req.user?.id;
        if (!adminId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const result = await this._updateChannelRequestUseCase.execute({workspaceId: workspaceId as string, channelId: channelId as string, userId: targetUserId as string, action, adminId});
        res.status(HttpStatusCode.OK).json(result);
        });

    markChannelAsRead = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { channelId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const result = await this._markChannelAsReadUseCase.execute({channelId: channelId as string, userId});
        res.status(result.statusCode).json({
                        success: result.success,
                        message: result.message
                    });
        });

    getUnreadCounts = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const result = await this._getUnreadCountsUseCase.execute({workspaceId: workspaceId as string, userId});
        res.status(result.statusCode).json({
                        success: result.success,
                        data: result.data
                    });
        });
}
