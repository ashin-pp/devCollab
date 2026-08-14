import { inject, injectable } from "tsyringe";
import type { IChannelRepository } from "../../interfaces/repositories/channel.repository.interface";
import type { IConversationRepository } from "../../interfaces/repositories/conversation.repository.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type { ICreateAIScheduleUseCase } from "../../interfaces/use-cases/ai/create-ai-schedule.usecase.interface";
import type { ISendDirectMessageUseCase } from "../../interfaces/use-cases/dm/send-direct-message.usecase.interface";
import type {
    IStartDmVideoCallUseCase,
    StartDmVideoCallDTO,
    StartDmVideoCallResult,
} from "../../interfaces/use-cases/ai/start-dm-video-call.usecase.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MessageType } from "../../../domain/enums/MessageType";
import { AppError } from "../../../domain/errors/AppError";
import { SocketService } from "../../../infrastructure/socket/socket.service";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";

const CALL_MINUTES = 30;

@injectable()
export class StartDmVideoCallUseCase implements IStartDmVideoCallUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IConversationRepository)
        private readonly _conversationRepository: IConversationRepository,
        @inject(REPOSITORY_TOKENS.IChannelRepository)
        private readonly _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(USECASE_TOKENS.ICreateAIScheduleUseCase)
        private readonly _createAIScheduleUseCase: ICreateAIScheduleUseCase,
        @inject(USECASE_TOKENS.ISendDirectMessageUseCase)
        private readonly _sendDirectMessageUseCase: ISendDirectMessageUseCase
    ) {}

    async execute(dto: StartDmVideoCallDTO): Promise<StartDmVideoCallResult> {
        const conversation = await this._conversationRepository.findById(dto.conversationId);
        if (!conversation || conversation.workspaceId !== dto.workspaceId) {
            throw new AppError(ErrorMessage.CONVERSATION_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const isParticipant =
            conversation.participant1Id === dto.userId ||
            conversation.participant2Id === dto.userId;
        if (!isParticipant) {
            throw new AppError(ErrorMessage.NOT_CONVERSATION_PARTICIPANT, HttpStatusCode.FORBIDDEN);
        }

        const participantId =
            conversation.participant1Id === dto.userId
                ? conversation.participant2Id
                : conversation.participant1Id;

        const channels = await this._channelRepository.findByWorkspaceId(dto.workspaceId);
        const channelId = channels[0]?.id;
        if (!channelId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
        }

        const [caller] = await this._userRepository.findByIds([dto.userId]);
        const callerName = caller?.name ?? "Someone";
        const title = `Call with ${callerName}`;

        const startsAt = new Date();
        const endsAt = new Date(startsAt.getTime() + CALL_MINUTES * 60_000);

        const schedule = await this._createAIScheduleUseCase.execute({
            organizerId: dto.userId,
            participantId,
            workspaceId: dto.workspaceId,
            channelId,
            title,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
            silent: true,
        });

        const meetLink = schedule.meetLink ?? "";
        const content = `${callerName} is calling you.\nJoin video: ${meetLink}`;

        const message = await this._sendDirectMessageUseCase.execute(
            dto.conversationId,
            dto.userId,
            content,
            MessageType.TEXT
        );

        const io = SocketService.getInstance()?.getIO();
        if (io) {
            io.to(`conversation:${dto.conversationId}`).emit("dm_received", message);
            io.to(`user:${participantId}`).emit("dm_received", message);
            io.to(`user:${participantId}`).emit("webrtc_incoming_call", {
                scheduleId: schedule.id,
                meetLink,
                title,
                conversationId: dto.conversationId,
                workspaceId: dto.workspaceId,
                callerId: dto.userId,
                callerName,
                callerImage: caller?.profileImage,
            });
        }

        return {
            scheduleId: schedule.id,
            meetLink,
            title,
            participantId,
            message,
        };
    }
}
