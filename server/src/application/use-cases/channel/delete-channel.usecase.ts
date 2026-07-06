import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class DeleteChannelUseCase implements IBaseUseCase<{workspaceId: string, channelId: string, requestUserId: string}, boolean> {
    constructor(
        @inject(TOKENS.IChannelRepository) private _channelRepository: IChannelRepository
    ) { }

    async execute(payload: {workspaceId: string, channelId: string, requestUserId: string}): Promise<boolean> {
        const { workspaceId, channelId, requestUserId } = payload;
        if (!workspaceId || !channelId) {
            throw new AppError(ErrorMessage.INVALID_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this._channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy !== requestUserId) {
            throw new AppError(ErrorMessage.CHANNEL_CREATOR_ONLY, HttpStatusCode.FORBIDDEN);
        }

        if (channel.name === "general") {
            throw new AppError(ErrorMessage.CANNOT_DELETE_GENERAL_CHANNEL, HttpStatusCode.BAD_REQUEST);
        }

        const success = await this._channelRepository.delete(channelId);
        if (!success) {
            throw new AppError(ErrorMessage.FAILED_TO_DELETE_CHANNEL, HttpStatusCode.INTERNAL_SERVER);
        }

        return true;
    }
}
