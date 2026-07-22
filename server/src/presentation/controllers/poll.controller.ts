import { NextFunction, Response } from "express";
import { inject, injectable } from 'tsyringe';
import type { IClosePollUseCase } from "../../application/interfaces/use-cases/poll/close-poll.usecase.interface";
import type { ICreatePollUseCase } from "../../application/interfaces/use-cases/poll/create-poll.usecase.interface";
import type { IDeletePollUseCase } from "../../application/interfaces/use-cases/poll/delete-poll.usecase.interface";
import type { IGetChannelPollsUseCase } from "../../application/interfaces/use-cases/poll/get-channel-polls.usecase.interface";
import type { IGetWorkspacePollsUseCase } from "../../application/interfaces/use-cases/poll/get-workspace-polls.usecase.interface";
import type { IVotePollUseCase } from "../../application/interfaces/use-cases/poll/vote-poll.usecase.interface";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AppError } from "../../domain/errors/AppError";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { SocketService } from "../../infrastructure/socket/socket.service";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class PollController {
    constructor(
        @inject(USECASE_TOKENS.ICreatePollUseCase) private readonly _createPollUseCase: ICreatePollUseCase,
        @inject(USECASE_TOKENS.IVotePollUseCase) private readonly _votePollUseCase: IVotePollUseCase,
        @inject(USECASE_TOKENS.IGetWorkspacePollsUseCase) private readonly _getWorkspacePollsUseCase: IGetWorkspacePollsUseCase,
        @inject(USECASE_TOKENS.IGetChannelPollsUseCase) private readonly _getChannelPollsUseCase: IGetChannelPollsUseCase,
        @inject(USECASE_TOKENS.IDeletePollUseCase) private readonly _deletePollUseCase: IDeletePollUseCase,
        @inject(USECASE_TOKENS.IClosePollUseCase) private readonly _closePollUseCase: IClosePollUseCase
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
