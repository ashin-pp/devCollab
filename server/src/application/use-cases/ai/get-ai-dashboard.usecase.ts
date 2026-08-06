import { inject, injectable } from "tsyringe";
import type { IAITaskRepository } from "../../interfaces/repositories/ai-task.repository.interface";
import type { IAIReminderRepository } from "../../interfaces/repositories/ai-reminder.repository.interface";
import type { IAIScheduleRepository } from "../../interfaces/repositories/ai-schedule.repository.interface";
import type { INotificationRepository } from "../../interfaces/repositories/notification.repository.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import type {
    GetAIDashboardDTO,
    AIDashboardPerson,
    AIDashboardResult,
    IGetAIDashboardUseCase,
} from "../../interfaces/use-cases/ai/get-ai-dashboard.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";

const NAME_FROM_MESSAGE = /^@([^\s]+)\s+in\s+#/;

@injectable()
export class GetAIDashboardUseCase implements IGetAIDashboardUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAITaskRepository)
        private readonly _aiTaskRepository: IAITaskRepository,
        @inject(REPOSITORY_TOKENS.IAIReminderRepository)
        private readonly _aiReminderRepository: IAIReminderRepository,
        @inject(REPOSITORY_TOKENS.IAIScheduleRepository)
        private readonly _aiScheduleRepository: IAIScheduleRepository,
        @inject(REPOSITORY_TOKENS.INotificationRepository)
        private readonly _notificationRepository: INotificationRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(USECASE_TOKENS.ICreateNotificationUseCase)
        private readonly _createNotificationUseCase: ICreateNotificationUseCase
    ) {}

    async execute(dto: GetAIDashboardDTO): Promise<AIDashboardResult> {
        const due = await this._aiReminderRepository.findDueUnsent(dto.userId, dto.workspaceId);
        await Promise.allSettled(
            due.map(async (reminder) => {
                if (!reminder.id) return;
                await this._createNotificationUseCase.execute({
                    userId: dto.userId,
                    type: "GENERAL",
                    title: "AI Reminder",
                    message: reminder.content,
                });
                await this._aiReminderRepository.markAsSent(reminder.id);
            })
        );

        const [tasks, reminders, schedules, notifications] = await Promise.all([
            this._aiTaskRepository.findForUserInWorkspace(dto.userId, dto.workspaceId),
            this._aiReminderRepository.findByUserInWorkspace(dto.userId, dto.workspaceId),
            this._aiScheduleRepository.findForUserInWorkspace(dto.userId, dto.workspaceId),
            this._notificationRepository.findAiNotifiesForUserInWorkspace(
                dto.userId,
                dto.workspaceId
            ),
        ]);

        const ids = new Set<string>();
        for (const t of tasks) {
            if (t.createdBy) ids.add(t.createdBy);
            if (t.assignedTo) ids.add(t.assignedTo);
        }
        for (const r of reminders) {
            if (r.userId) ids.add(r.userId);
            if (r.senderId) ids.add(r.senderId);
        }
        for (const s of schedules) {
            if (s.organizerId) ids.add(s.organizerId);
            if (s.participantId) ids.add(s.participantId);
        }
        for (const n of notifications) {
            if (n.actorId) ids.add(n.actorId);
        }

        const nameById = await this.resolveNames([...ids]);

        return {
            tasks: tasks.map((t) => {
                const assignedToYou = t.assignedTo === dto.userId;
                const personId = assignedToYou ? t.createdBy : t.assignedTo;
                const person: AIDashboardPerson = {
                    id: personId,
                    name: this.displayName(personId, dto.userId, nameById),
                    label: assignedToYou ? "From" : "For",
                };
                return {
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    status: t.status,
                    dueDate: t.dueDate,
                    assignedTo: t.assignedTo,
                    createdBy: t.createdBy,
                    channelId: t.channelId,
                    person,
                };
            }),
            reminders: reminders.map((r) => {
                const fromOther =
                    Boolean(r.senderId) &&
                    r.senderId !== r.userId &&
                    r.senderId !== "000000000000000000000000";
                const personId = fromOther ? r.senderId! : r.userId;
                const person: AIDashboardPerson = {
                    id: personId,
                    name: this.displayName(personId, dto.userId, nameById),
                    label: fromOther ? "From" : "For",
                };
                return {
                    id: r.id,
                    content: r.content,
                    remindAt: r.remindAt,
                    isSent: r.isSent,
                    channelId: r.channelId,
                    userId: r.userId,
                    senderId: r.senderId,
                    person,
                };
            }),
            schedules: schedules.map((s) => {
                const otherId =
                    s.organizerId === dto.userId ? s.participantId : s.organizerId;
                const person: AIDashboardPerson = {
                    id: otherId,
                    name: this.displayName(otherId, dto.userId, nameById),
                    label: "With",
                };
                return {
                    id: s.id,
                    title: s.title,
                    startsAt: s.startsAt,
                    endsAt: s.endsAt,
                    meetLink: s.meetLink,
                    status: s.status,
                    organizerId: s.organizerId,
                    participantId: s.participantId,
                    channelId: s.channelId,
                    person,
                };
            }),
            notifications: notifications.map((n) => {
                let name = n.actorId
                    ? this.displayName(n.actorId, dto.userId, nameById)
                    : undefined;
                if (!name) {
                    const match = n.message?.match(NAME_FROM_MESSAGE);
                    name = match?.[1] || "Someone";
                }
                const person: AIDashboardPerson = {
                    id: n.actorId,
                    name,
                    label: "From",
                };
                return {
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    isRead: n.isRead,
                    createdAt: n.createdAt,
                    actorId: n.actorId,
                    person,
                };
            }),
        };
    }

    private displayName(
        personId: string | undefined,
        viewerId: string,
        nameById: Map<string, string>
    ): string {
        if (!personId) return "Someone";
        if (personId === viewerId) return "You";
        return nameById.get(personId) || "Someone";
    }

    private async resolveNames(ids: string[]): Promise<Map<string, string>> {
        const map = new Map<string, string>();
        await Promise.all(
            ids.map(async (id) => {
                if (!id || id === "000000000000000000000000") return;
                try {
                    const user = await this._userRepository.findById(id);
                    if (user?.name) map.set(id, user.name);
                } catch {
                    // ignore missing users
                }
            })
        );
        return map;
    }
}
