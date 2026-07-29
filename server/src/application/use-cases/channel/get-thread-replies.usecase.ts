import { inject, injectable } from 'tsyringe';
import type { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { IGetThreadRepliesUseCase } from "../../interfaces/use-cases/channel/get-thread-replies.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetThreadRepliesUseCase implements IGetThreadRepliesUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IMessageRepository) private _messageRepository: IMessageRepository
    ) {}

    async execute(payload: {
        threadRootId: string;
        channelId: string;
        viewerId: string;
    }) {
        const { threadRootId, channelId, viewerId } = payload;

        const rootMessage = await this._messageRepository.findById(threadRootId);
        if (!rootMessage || rootMessage.channelId !== channelId) {
            throw new AppError(ErrorMessage.PARENT_MESSAGE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (rootMessage.threadRootId) {
            throw new AppError(ErrorMessage.INVALID_THREAD_REPLY, HttpStatusCode.BAD_REQUEST);
        }

        const replies = await this._messageRepository.findThreadReplies(threadRootId, viewerId);
        rootMessage.replyCount = replies.length;

        return { rootMessage, replies };
    }
}
