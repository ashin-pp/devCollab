import { Response, NextFunction } from "express";
import { CreatePollUseCase } from "../../application/use-cases/poll/CreatePollUseCase";
import { VotePollUseCase } from "../../application/use-cases/poll/VotePollUseCase";
import { GetWorkspacePollsUseCase } from "../../application/use-cases/poll/GetWorkspacePollsUseCase";
import { GetChannelPollsUseCase } from "../../application/use-cases/poll/GetChannelPollsUseCase";
import { DeletePollUseCase } from "../../application/use-cases/poll/DeletePollUseCase";
import { ClosePollUseCase } from "../../application/use-cases/poll/ClosePollUseCase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { AppError } from "../../domain/errors/AppError";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { SocketService } from "../../infra/socket/SocketService";

export class PollController {
    constructor(
        private readonly createPollUseCase: CreatePollUseCase,
        private readonly votePollUseCase: VotePollUseCase,
        private readonly getWorkspacePollsUseCase: GetWorkspacePollsUseCase,
        private readonly getChannelPollsUseCase: GetChannelPollsUseCase,
        private readonly deletePollUseCase: DeletePollUseCase,
        private readonly closePollUseCase: ClosePollUseCase
    ) {}

    public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
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
            
            const poll = await this.createPollUseCase.execute(pollData);
            
            // Emit socket event
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
        } catch (error) {
            next(error);
        }
    };

    public vote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const pollId = req.params.id as string;
            const { optionId } = req.body;

            const poll = await this.votePollUseCase.execute(pollId, userId, optionId);
            
            // Emit socket event
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
        } catch (error) {
            next(error);
        }
    };

    public getWorkspacePolls = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const workspaceId = req.params.workspaceId as string;
            const polls = await this.getWorkspacePollsUseCase.execute(workspaceId);
            
            const response = ApiResponse.success("Workspace polls retrieved successfully", polls);
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public getChannelPolls = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const channelId = req.params.channelId as string;
            const polls = await this.getChannelPollsUseCase.execute(channelId);
            
            const response = ApiResponse.success("Channel polls retrieved successfully", polls);
            res.status(HttpStatusCode.OK).json(response);
        } catch (error) {
            next(error);
        }
    };

    public delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const pollId = req.params.id as string;

            const poll = await this.deletePollUseCase.execute(pollId, userId);
            
            // Emit socket event
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
        } catch (error) {
            next(error);
        }
    };

    public close = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const pollId = req.params.id as string;

            const poll = await this.closePollUseCase.execute(pollId, userId);
            
            // Emit socket event 
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
        } catch (error) {
            next(error);
        }
    };
}
