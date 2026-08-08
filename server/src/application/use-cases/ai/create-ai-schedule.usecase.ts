import { inject, injectable } from "tsyringe";
import type { IAIScheduleRepository } from "../../interfaces/repositories/ai-schedule.repository.interface";
import type {
    CreateAIScheduleDTO,
    CreateAIScheduleResult,
    ICreateAIScheduleUseCase,
} from "../../interfaces/use-cases/ai/create-ai-schedule.usecase.interface";
import type { ICreateAIReminderUseCase } from "../../interfaces/use-cases/ai/create-ai-reminder.usecase.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import { NotificationTitle } from "../../../domain/enums/NotificationMessage";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";

const PRE_MEETING_MINUTES = 15;
const SYSTEM_AGENT_ID = "000000000000000000000000";

@injectable()
export class CreateAIScheduleUseCase implements ICreateAIScheduleUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAIScheduleRepository)
        private readonly _aiScheduleRepository: IAIScheduleRepository,
        @inject(USECASE_TOKENS.ICreateAIReminderUseCase)
        private readonly _createAIReminderUseCase: ICreateAIReminderUseCase,
        @inject(USECASE_TOKENS.ICreateNotificationUseCase)
        private readonly _createNotificationUseCase: ICreateNotificationUseCase
    ) {}

    async execute(dto: CreateAIScheduleDTO): Promise<CreateAIScheduleResult> {
        const startsAt = new Date(dto.startsAt);
        const endsAt = new Date(dto.endsAt);
        const reminderAt = new Date(startsAt.getTime() - PRE_MEETING_MINUTES * 60_000);
        const meetSuffix = dto.meetLink ? ` Join: ${dto.meetLink}` : "";

        const schedule = await this._aiScheduleRepository.create({
            organizerId: dto.organizerId,
            participantId: dto.participantId,
            workspaceId: dto.workspaceId,
            channelId: dto.channelId,
            title: dto.title,
            startsAt,
            endsAt,
            status: "scheduled",
            meetLink: dto.meetLink,
            googleEventId: dto.googleEventId,
            reminderSent: false,
        });

        if (reminderAt.getTime() > Date.now()) {
            const reminderContent = `Your 1:1 "${dto.title}" starts in ${PRE_MEETING_MINUTES} minutes.${meetSuffix}`;
            const reminderBase = {
                workspaceId: dto.workspaceId,
                channelId: dto.channelId,
                content: reminderContent,
                remindAt: reminderAt.toISOString(),
                senderId: SYSTEM_AGENT_ID,
            };
            await Promise.all([
                this._createAIReminderUseCase.execute({ ...reminderBase, userId: dto.organizerId }),
                this._createAIReminderUseCase.execute({ ...reminderBase, userId: dto.participantId }),
            ]);
        }

        const notifyMessage = `1:1 scheduled: "${dto.title}" at ${startsAt.toLocaleString()}.${meetSuffix}`;
        await Promise.allSettled([
            this._createNotificationUseCase.execute({
                userId: dto.organizerId,
                type: "GENERAL",
                title: NotificationTitle.MEETING_SCHEDULED,
                message: notifyMessage,
            }),
            this._createNotificationUseCase.execute({
                userId: dto.participantId,
                type: "GENERAL",
                title: NotificationTitle.MEETING_SCHEDULED,
                message: notifyMessage,
            }),
        ]);

        return {
            id: schedule.id as string,
            title: dto.title,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
            meetLink: dto.meetLink,
            reminderAt: reminderAt.toISOString(),
            schedule,
        };
    }
}
