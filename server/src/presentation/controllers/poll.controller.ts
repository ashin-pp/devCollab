import { injectable, inject } from 'tsyringe';
import { Response, NextFunction } from "express";
import { CreatePollUseCase } from "../../application/use-cases/poll/create-poll.usecase";
import { VotePollUseCase } from "../../application/use-cases/poll/vote-poll.usecase";
import { GetWorkspacePollsUseCase } from "../../application/use-cases/poll/get-workspace-polls.usecase";
import { GetChannelPollsUseCase } from "../../application/use-cases/poll/get-channel-polls.usecase";
import { DeletePollUseCase } from "../../application/use-cases/poll/delete-poll.usecase";
import { ClosePollUseCase } from "../../application/use-cases/poll/close-poll.usecase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { AppError } from "../../domain/errors/AppError";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { SocketService } from "../../infrastructure/socket/socket.service";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class PollController {
    constructor(
        @inject(CreatePollUseCase) private readonly _createPollUseCase: CreatePollUseCase,
        @inject(VotePollUseCase) private readonly _votePollUseCase: VotePollUseCase,
        @inject(GetWorkspacePollsUseCase) private readonly _getWorkspacePollsUseCase: GetWorkspacePollsUseCase,
        @inject(GetChannelPollsUseCase) private readonly _getChannelPollsUseCase: GetChannelPollsUseCase,
        @inject(DeletePollUseCase) private readonly _deletePollUseCase: DeletePollUseCase,
        @inject(ClosePollUseCase) private readonly _closePollUseCase: ClosePollUseCase
    ) {}

    public create = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const { workspaceId, channelId, question, options, expiresAt, startsAt } = req.body;
        const pollData = {
                        workspaceId,
                        channelId,
                        question,
                        options,
                        createdBy: userId,
                        expiresAt,
                        startsAt
                    };
        const poll = await this._createPollUseCase.execute(pollData);
        const io = SocketService.getInstance()?.getIO();
        if (io) {
                        if (channelId) {
                            io.to(`channel:${channelId}`).emit('new_poll', poll);
                        } else {
                            io.to(`workspace:${workspaceId}`).emit('new_poll', poll);
                        }
                    }
        const response = ApiResponse.success("Poll created successfully", poll);
        res.status(HttpStatusCode.CREATED).json(response);
        });

    public vote = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const pollId = req.params.id as string;
        const { optionId } = req.body;
        const poll = await this._votePollUseCase.execute(pollId, userId, optionId);
        const io = SocketService.getInstance()?.getIO();
        if (io) {
                        if (poll.channelId) {
                            io.to(`channel:${poll.channelId}`).emit('poll_voted', poll);
                        } else {
                            io.to(`workspace:${poll.workspaceId}`).emit('poll_voted', poll);
                        }
                    }
        const response = ApiResponse.success("Vote cast successfully", poll);
        res.status(HttpStatusCode.OK).json(response);
        });

    public getWorkspacePolls = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const workspaceId = req.params.workspaceId as string;
        const polls = await this._getWorkspacePollsUseCase.execute(workspaceId);
        const response = ApiResponse.success("Workspace polls retrieved successfully", polls);
        res.status(HttpStatusCode.OK).json(response);
        });

    public getChannelPolls = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const channelId = req.params.channelId as string;
        const polls = await this._getChannelPollsUseCase.execute(channelId);
        const response = ApiResponse.success("Channel polls retrieved successfully", polls);
        res.status(HttpStatusCode.OK).json(response);
        });

    public delete = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const pollId = req.params.id as string;
        const poll = await this._deletePollUseCase.execute(pollId, userId);
        const io = SocketService.getInstance()?.getIO();
        if (io) {
                        if (poll.channelId) {
                            io.to(`channel:${poll.channelId}`).emit('poll_deleted', pollId);
                        } else {
                            io.to(`workspace:${poll.workspaceId}`).emit('poll_deleted', pollId);
                        }
                    }
        const response = ApiResponse.success("Poll deleted successfully", null);
        res.status(HttpStatusCode.OK).json(response);
        });

    public close = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const pollId = req.params.id as string;
        const poll = await this._closePollUseCase.execute(pollId, userId);
        const io = SocketService.getInstance()?.getIO();
        if (io) {
                        if (poll.channelId) {
                            io.to(`channel:${poll.channelId}`).emit('poll_updated', poll);
                        } else {
                            io.to(`workspace:${poll.workspaceId}`).emit('poll_updated', poll);
                        }
                    }
        const response = ApiResponse.success("Poll closed successfully", poll);
        res.status(HttpStatusCode.OK).json(response);
        });
}
