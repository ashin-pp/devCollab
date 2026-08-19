import { Request, Response, NextFunction } from "express";
import { AppError } from "../../domain/errors/AppError";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { ChannelModel } from "../../infrastructure/database/models/channel.model";

export const checkChannelActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { channelId } = req.params;
        
        if (!channelId) {
            return next();
        }

        const channel = await ChannelModel.findById(channelId);
        
        if (!channel) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (!channel.is_active) {
            throw new AppError(ErrorMessage.CHANNEL_BLOCKED_BY_ADMIN, HttpStatusCode.FORBIDDEN);
        }

        next();
    } catch (error) {
        next(error);
    }
};
