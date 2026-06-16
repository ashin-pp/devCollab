import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { CreateChannelUseCase } from '../../application/use-cases/channel/CreateChannelUseCase';
import { GetWorkspaceChannelsUseCase } from '../../application/use-cases/channel/GetWorkspaceChannelsUseCase';
import { HttpStatusCode } from '../../domain/enums/HttpStatusCode';
import { AppError } from '../../domain/errors/AppError';
import { ErrorMessage } from '../../domain/enums/ErrorMessage';

export class ChannelController {
    constructor(
        private createChannelUseCase: CreateChannelUseCase,
        private getWorkspaceChannelsUseCase: GetWorkspaceChannelsUseCase
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
}
