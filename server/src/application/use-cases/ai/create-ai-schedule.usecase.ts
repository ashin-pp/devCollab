import { inject, injectable } from "tsyringe";
import type { IAIScheduleRepository } from "../../interfaces/repositories/ai-schedule.repository.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type {
    CreateAIScheduleDTO,
    CreateAIScheduleResult,
    ICreateAIScheduleUseCase,
} from "../../interfaces/use-cases/ai/create-ai-schedule.usecase.interface";
import type { ICreateAIReminderUseCase } from "../../interfaces/use-cases/ai/create-ai-reminder.usecase.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import type { ILogger } from "../../interfaces/services/logger.service.interface";
import type { AIScheduleVideoProvider } from "../../../domain/entities/ai-schedule.entity";
import { NotificationTitle } from "../../../domain/enums/NotificationMessage";
import { envConfig } from "../../../config/envConfig";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";
import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";

const PRE_MEETING_MINUTES = 15;
const SYSTEM_AGENT_ID = "000000000000000000000000";

@injectable()
export class CreateAIScheduleUseCase implements ICreateAIScheduleUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAIScheduleRepository)
        private readonly _aiScheduleRepository: IAIScheduleRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(USECASE_TOKENS.ICreateAIReminderUseCase)
        private readonly _createAIReminderUseCase: ICreateAIReminderUseCase,
        @inject(USECASE_TOKENS.ICreateNotificationUseCase)
        private readonly _createNotificationUseCase: ICreateNotificationUseCase,
        @inject(SERVICE_TOKENS.ILogger)
        private readonly _logger: ILogger
    ) {}

    async execute(dto: CreateAIScheduleDTO): Promise<CreateAIScheduleResult> {
        const startsAt = new Date(dto.startsAt);
        const endsAt = new Date(dto.endsAt);
        const reminderAt = new Date(startsAt.getTime() - PRE_MEETING_MINUTES * 60_000);

        const extraParticipantIds = (dto.participantIds ?? []).filter(
            (id) => id && id !== dto.participantId && id !== dto.organizerId
        );

        const schedule = await this._aiScheduleRepository.create({
            organizerId: dto.organizerId,
            participantId: dto.participantId,
            participantIds: extraParticipantIds,
            workspaceId: dto.workspaceId,
            channelId: dto.channelId,
            title: dto.title,
            startsAt,
            endsAt,
            status: "scheduled",
            reminderSent: false,
            videoProvider: "none",
        });

        let meetLink: string | undefined;
        let videoProvider: AIScheduleVideoProvider = "none";
        let roomName: string | undefined;

        if (schedule.id) {
            roomName = `dc-${schedule.id}`.toLowerCase();
            meetLink = `${envConfig.clientUrl.replace(/\/$/, "")}/call/${schedule.id}`;
            videoProvider = "webrtc";

            const updated = await this._aiScheduleRepository.update(schedule.id, {
                roomName,
                meetLink,
                videoProvider,
            });
            if (updated) {
                Object.assign(schedule, updated);
            }
        } else {
            this._logger.error("[CreateAISchedule] Schedule created without an id.");
        }

        const meetSuffix = meetLink ? ` Join video: ${meetLink}` : "";

        const inviteeIds = Array.from(
            new Set([dto.organizerId, dto.participantId, ...extraParticipantIds])
        );

        const [organizer] = await this._userRepository.findByIds([dto.organizerId]);
        const organizerName = organizer?.name ?? "Someone";

        const noteBit = dto.note?.trim() ? ` ${dto.note.trim()}` : "";

        if (dto.silent) {
            return {
                id: schedule.id as string,
                title: dto.title,
                startsAt: startsAt.toISOString(),
                endsAt: endsAt.toISOString(),
                meetLink: meetLink ?? schedule.meetLink,
                videoProvider,
                roomName: roomName ?? schedule.roomName,
                reminderAt: reminderAt.toISOString(),
                schedule,
            };
        }

        if (reminderAt.getTime() > Date.now()) {
            const reminderContent = `${organizerName} created a video call "${dto.title}" starting in ${PRE_MEETING_MINUTES} minutes.${noteBit}${meetSuffix}`;
            const reminderBase = {
                workspaceId: dto.workspaceId,
                channelId: dto.channelId,
                content: reminderContent,
                remindAt: reminderAt.toISOString(),
                senderId: SYSTEM_AGENT_ID,
            };
            await Promise.all(
                inviteeIds.map((userId) =>
                    this._createAIReminderUseCase.execute({ ...reminderBase, userId })
                )
            );
        }

        const notifyMessage = `${organizerName} created a video call: "${dto.title}" at ${startsAt.toLocaleString()}.${noteBit}${meetSuffix}`;
        await Promise.allSettled(
            inviteeIds.map((userId) =>
                this._createNotificationUseCase.execute({
                    userId,
                    type: "GENERAL",
                    title: NotificationTitle.MEETING_SCHEDULED,
                    message: notifyMessage,
                    actorId: dto.organizerId,
                })
            )
        );

        return {
            id: schedule.id as string,
            title: dto.title,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
            meetLink: meetLink ?? schedule.meetLink,
            videoProvider,
            roomName: roomName ?? schedule.roomName,
            reminderAt: reminderAt.toISOString(),
            schedule,
        };
    }
}
