import { Request, Response, NextFunction } from 'express';
import { AppError } from "../../domain/errors/AppError";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { ChannelModel } from "../../infra/database/models/ChannelModel";

export const checkChannelActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { channelId } = req.params;
        
        if (!channelId) {
            return next();
        }

        const channel = await ChannelModel.findById(channelId);
        
        if (!channel) {
            throw new AppError('Channel not found', HttpStatusCode.NOT_FOUND);
        }

        if (!channel.is_active) {
            throw new AppError('This channel has been blocked by the workspace admin or owner.', HttpStatusCode.FORBIDDEN);
        }

        next();
    } catch (error) {
        next(error);
    }
};
