import { Response } from "express";
import { inject, injectable } from "tsyringe";
import type { IClosePollUseCase } from "../../application/interfaces/use-cases/poll/close-poll.usecase.interface";
import type { ICreatePollUseCase } from "../../application/interfaces/use-cases/poll/create-poll.usecase.interface";
import type { IDeletePollUseCase } from "../../application/interfaces/use-cases/poll/delete-poll.usecase.interface";
import type { IGetChannelPollsUseCase } from "../../application/interfaces/use-cases/poll/get-channel-polls.usecase.interface";
import type { IGetWorkspacePollsUseCase } from "../../application/interfaces/use-cases/poll/get-workspace-polls.usecase.interface";
import type { IVotePollUseCase } from "../../application/interfaces/use-cases/poll/vote-poll.usecase.interface";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { SocketService } from "../../infrastructure/socket/socket.service";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";
import { requireUserId } from "../utils/require-user-id";

@injectable()
export class PollController {
    constructor(
        @inject(USECASE_TOKENS.ICreatePollUseCase)
        private readonly _createPollUseCase: ICreatePollUseCase,
        @inject(USECASE_TOKENS.IVotePollUseCase)
        private readonly _votePollUseCase: IVotePollUseCase,
        @inject(USECASE_TOKENS.IGetWorkspacePollsUseCase)
        private readonly _getWorkspacePollsUseCase: IGetWorkspacePollsUseCase,
        @inject(USECASE_TOKENS.IGetChannelPollsUseCase)
        private readonly _getChannelPollsUseCase: IGetChannelPollsUseCase,
        @inject(USECASE_TOKENS.IDeletePollUseCase)
        private readonly _deletePollUseCase: IDeletePollUseCase,
        @inject(USECASE_TOKENS.IClosePollUseCase)
        private readonly _closePollUseCase: IClosePollUseCase
    ) {}

    create = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const { workspaceId, channelId, question, options, expiresAt, startsAt } = req.body;
        const poll = await this._createPollUseCase.execute({
            workspaceId,
            channelId,
            question,
            options,
            createdBy: userId,
            expiresAt,
            startsAt,
        });
        const io = SocketService.getInstance()?.getIO();
        if (io) {
            if (channelId) {
                io.to(`channel:${channelId}`).emit("new_poll", poll);
            } else {
                io.to(`workspace:${workspaceId}`).emit("new_poll", poll);
            }
        }
        res.status(HttpStatusCode.CREATED).json(
            ApiResponse.success(SuccessMessage.POLL_CREATED, poll)
        );
    });

    vote = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const pollId = req.params.id as string;
        const { optionId } = req.body;
        const poll = await this._votePollUseCase.execute(pollId, userId, optionId);
        const io = SocketService.getInstance()?.getIO();
        if (io) {
            if (poll.channelId) {
                io.to(`channel:${poll.channelId}`).emit("poll_voted", poll);
            } else {
                io.to(`workspace:${poll.workspaceId}`).emit("poll_voted", poll);
            }
        }
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.POLL_VOTED, poll)
        );
    });

    getWorkspacePolls = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const workspaceId = req.params.workspaceId as string;
        const polls = await this._getWorkspacePollsUseCase.execute(workspaceId);
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.WORKSPACE_POLLS_FETCHED, polls)
        );
    });

    getChannelPolls = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const channelId = req.params.channelId as string;
        const polls = await this._getChannelPollsUseCase.execute(channelId);
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.CHANNEL_POLLS_FETCHED, polls)
        );
    });

    delete = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const pollId = req.params.id as string;
        const poll = await this._deletePollUseCase.execute(pollId, userId);
        const io = SocketService.getInstance()?.getIO();
        if (io) {
            if (poll.channelId) {
                io.to(`channel:${poll.channelId}`).emit("poll_deleted", pollId);
            } else {
                io.to(`workspace:${poll.workspaceId}`).emit("poll_deleted", pollId);
            }
        }
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.POLL_DELETED, null)
        );
    });

    close = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const pollId = req.params.id as string;
        const poll = await this._closePollUseCase.execute(pollId, userId);
        const io = SocketService.getInstance()?.getIO();
        if (io) {
            if (poll.channelId) {
                io.to(`channel:${poll.channelId}`).emit("poll_updated", poll);
            } else {
                io.to(`workspace:${poll.workspaceId}`).emit("poll_updated", poll);
            }
        }
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.POLL_CLOSED, poll)
        );
    });
}
