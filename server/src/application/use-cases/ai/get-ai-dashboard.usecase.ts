import { inject, injectable } from "tsyringe";
import type { IAITaskRepository } from "../../interfaces/repositories/ai-task.repository.interface";
import type { IAIReminderRepository } from "../../interfaces/repositories/ai-reminder.repository.interface";
import type { IAIScheduleRepository } from "../../interfaces/repositories/ai-schedule.repository.interface";
import type { INotificationRepository } from "../../interfaces/repositories/notification.repository.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type { IWorkspaceRepository } from "../../interfaces/repositories/workspace.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import type { ICreateNotificationUseCase } from "../../interfaces/use-cases/notification/create-notification.usecase.interface";
import type {
    GetAIDashboardDTO,
    AIDashboardPerson,
    AIDashboardResult,
    IGetAIDashboardUseCase,
} from "../../interfaces/use-cases/ai/get-ai-dashboard.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";
import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { NotificationTitle } from "../../../domain/enums/NotificationMessage";

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
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository)
        private readonly _workspaceRepository: IWorkspaceRepository,
        @inject(SERVICE_TOKENS.IPlanEntitlementService)
        private readonly _planEntitlementService: IPlanEntitlementService,
        @inject(USECASE_TOKENS.ICreateNotificationUseCase)
        private readonly _createNotificationUseCase: ICreateNotificationUseCase
    ) {}

    async execute(dto: GetAIDashboardDTO): Promise<AIDashboardResult> {
        const workspace = await this._workspaceRepository.findById(dto.workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const ownerEntitlement = await this._planEntitlementService.resolveForUserId(workspace.createdBy);
        if (ownerEntitlement.isExpired) {
            throw new AppError(ErrorMessage.SUBSCRIPTION_EXPIRED, HttpStatusCode.FORBIDDEN);
        }
        if (!ownerEntitlement.plan.aiAssistantEnabled) {
            throw new AppError(ErrorMessage.AI_ASSISTANT_DISABLED, HttpStatusCode.FORBIDDEN);
        }

        const due = await this._aiReminderRepository.findDueUnsent(dto.userId, dto.workspaceId);
        await Promise.allSettled(
            due.map(async (reminder) => {
                if (!reminder.id) return;

                let message = reminder.content;
                const senderId = reminder.senderId;
                if (senderId && senderId !== "000000000000000000000000") {
                    const sender = await this._userRepository.findById(senderId);
                    if (sender) {
                        message = `@${sender.name} reminded you: "${reminder.content}"`;
                    }
                }

                await this._createNotificationUseCase.execute({
                    userId: dto.userId,
                    type: "GENERAL",
                    title: NotificationTitle.AI_REMINDER,
                    message,
                    relatedId: dto.workspaceId,
                    actorId: senderId,
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
            for (const pid of s.participantIds ?? []) {
                if (pid) ids.add(pid);
            }
        }
        for (const n of notifications) {
            if (n.actorId) ids.add(n.actorId);
        }

        const nameById = await this.resolveNames([...ids]);

        const mappedTasks = tasks.map((t) => {
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
        });

        const mappedReminders = reminders.map((r) => {
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
        });

        const mappedSchedules = schedules.map((s) => {
            const withIds = Array.from(
                new Set([s.participantId, ...(s.participantIds ?? [])].filter(
                    (id) => id && id !== s.organizerId
                ))
            );
            const withNames = withIds
                .map((id) => this.displayName(id, dto.userId, nameById))
                .filter(Boolean);
            const person: AIDashboardPerson = {
                id: withIds[0],
                name: withNames.join(", ") || this.displayName(
                    s.organizerId === dto.userId ? s.participantId : s.organizerId,
                    dto.userId,
                    nameById
                ),
                label: "With",
            };
            const organizer: AIDashboardPerson = {
                id: s.organizerId,
                name: this.displayName(s.organizerId, dto.userId, nameById),
                label: "Created by",
            };
            return {
                id: s.id,
                title: s.title,
                startsAt: s.startsAt,
                endsAt: s.endsAt,
                meetLink: s.meetLink,
                videoProvider: s.videoProvider,
                roomName: s.roomName,
                status: s.status,
                organizerId: s.organizerId,
                participantId: s.participantId,
                participantIds: s.participantIds ?? [],
                channelId: s.channelId,
                person,
                organizer,
            };
        });

        const mappedNotifications = notifications.map((n) => {
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
        });

        return {
            tasks: mappedTasks,
            reminders: mappedReminders,
            schedules: mappedSchedules,
            notifications: mappedNotifications,
            counts: {
                tasks: mappedTasks.filter(
                    (t) =>
                        String(t.status).toLowerCase() !== "completed" &&
                        String(t.status).toLowerCase() !== "done"
                ).length,
                reminders: mappedReminders.filter((r) => !r.isSent).length,
                schedules: mappedSchedules.length,
                notifications: mappedNotifications.filter((n) => !n.isRead).length,
            },
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
