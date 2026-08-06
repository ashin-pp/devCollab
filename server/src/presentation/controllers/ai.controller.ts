import { NextFunction, Request, Response } from "express";
import { inject, injectable } from 'tsyringe';
import type { IHandleAiCommandUseCase } from "../../application/interfaces/use-cases/ai/handle-ai-command.usecase.interface";
import type { IGetAIDashboardUseCase } from "../../application/interfaces/use-cases/ai/get-ai-dashboard.usecase.interface";
import type { IClearAIDashboardTabUseCase } from "../../application/interfaces/use-cases/ai/clear-ai-dashboard-tab.usecase.interface";
import type { IUpdateAITaskStatusUseCase } from "../../application/interfaces/use-cases/ai/update-ai-task-status.usecase.interface";
import type { IPlanEntitlementService } from "../../application/interfaces/services/plan-entitlement.service.interface";
import type { IWorkspaceRepository } from "../../application/interfaces/repositories/workspace.repository.interface";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { SERVICE_TOKENS } from "../../infrastructure/di/service.tokens";
import { REPOSITORY_TOKENS } from "../../infrastructure/di/repository.tokens";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";
import { AppError } from "../../domain/errors/AppError";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AITaskStatus } from "../../domain/enums/AITaskStatus";

@injectable()
export class AIController {
    constructor(
        @inject(USECASE_TOKENS.IHandleAiCommandUseCase) private _handleAiCommandUseCase: IHandleAiCommandUseCase,
        @inject(USECASE_TOKENS.IGetAIDashboardUseCase) private _getAIDashboardUseCase: IGetAIDashboardUseCase,
        @inject(USECASE_TOKENS.IClearAIDashboardTabUseCase) private _clearAIDashboardTabUseCase: IClearAIDashboardTabUseCase,
        @inject(USECASE_TOKENS.IUpdateAITaskStatusUseCase) private _updateAITaskStatusUseCase: IUpdateAITaskStatusUseCase,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService,
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository
    ) {}

    processMessage = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { input, workspaceId, channelId } = req.body;
        const userId = (req as Request & { user?: { id: string } }).user?.id || "000000000000000000000000";
        if (!input || !workspaceId || !channelId || !userId) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }
        const response = await this._handleAiCommandUseCase.execute(input, workspaceId, channelId, userId);
        res.status(200).json({ success: true, data: { response } });
    });

    getDashboard = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const workspaceId = String(req.query.workspaceId || "");
        const userId = (req as Request & { user?: { id: string } }).user?.id;

        if (!workspaceId || !userId) {
            res.status(400).json({ success: false, message: "Missing workspaceId or user" });
            return;
        }

        const workspace = await this._workspaceRepository.findById(workspaceId);
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

        const data = await this._getAIDashboardUseCase.execute({ userId, workspaceId });

        res.status(200).json({
            success: true,
            data: {
                tasks: data.tasks.map((t) => ({
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    status: t.status,
                    dueDate: t.dueDate,
                    assignedTo: t.assignedTo,
                    createdBy: t.createdBy,
                    channelId: t.channelId,
                    person: t.person,
                })),
                reminders: data.reminders.map((r) => ({
                    id: r.id,
                    content: r.content,
                    remindAt: r.remindAt,
                    isSent: r.isSent,
                    channelId: r.channelId,
                    person: r.person,
                })),
                schedules: data.schedules.map((s) => ({
                    id: s.id,
                    title: s.title,
                    startsAt: s.startsAt,
                    endsAt: s.endsAt,
                    meetLink: s.meetLink,
                    status: s.status,
                    organizerId: s.organizerId,
                    participantId: s.participantId,
                    channelId: s.channelId,
                    person: s.person,
                })),
                notifications: data.notifications.map((n) => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    isRead: n.isRead,
                    createdAt: n.createdAt,
                    person: n.person,
                })),
                counts: {
                    tasks: data.tasks.filter((t) => String(t.status).toLowerCase() !== "completed" && String(t.status).toLowerCase() !== "done").length,
                    reminders: data.reminders.filter((r) => !r.isSent).length,
                    schedules: data.schedules.length,
                    notifications: data.notifications.filter((n) => !n.isRead).length,
                },
            },
        });
    });

    clearDashboardTab = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const workspaceId = String(req.body.workspaceId || "");
        const tab = String(req.body.tab || "") as "tasks" | "reminders" | "notifications" | "schedule";
        const userId = (req as Request & { user?: { id: string } }).user?.id;

        if (!workspaceId || !userId || !tab) {
            res.status(400).json({ success: false, message: "Missing workspaceId, tab, or user" });
            return;
        }

        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const result = await this._clearAIDashboardTabUseCase.execute({
            userId,
            workspaceId,
            tab,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    });

    updateTaskStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const workspaceId = String(req.body.workspaceId || "");
        const status = String(req.body.status || AITaskStatus.DONE) as AITaskStatus;
        const taskId = String(req.params.taskId || "");
        const userId = (req as Request & { user?: { id: string } }).user?.id;

        if (!workspaceId || !userId || !taskId) {
            res.status(400).json({ success: false, message: "Missing workspaceId, taskId, or user" });
            return;
        }

        const task = await this._updateAITaskStatusUseCase.execute({
            taskId,
            userId,
            workspaceId,
            status,
        });

        res.status(200).json({
            success: true,
            data: {
                id: task.id,
                title: task.title,
                status: task.status,
                assignedTo: task.assignedTo,
                createdBy: task.createdBy,
            },
        });
    });
}
