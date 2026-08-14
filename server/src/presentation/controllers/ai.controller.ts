import { Response } from "express";
import { inject, injectable } from "tsyringe";
import type { IHandleAiCommandUseCase } from "../../application/interfaces/use-cases/ai/handle-ai-command.usecase.interface";
import type { IGetAIDashboardUseCase } from "../../application/interfaces/use-cases/ai/get-ai-dashboard.usecase.interface";
import type { IClearAIDashboardTabUseCase } from "../../application/interfaces/use-cases/ai/clear-ai-dashboard-tab.usecase.interface";
import type { IUpdateAITaskStatusUseCase } from "../../application/interfaces/use-cases/ai/update-ai-task-status.usecase.interface";
import type { IJoinAIScheduleVideoUseCase } from "../../application/interfaces/use-cases/ai/join-ai-schedule-video.usecase.interface";
import type { IStartDmVideoCallUseCase } from "../../application/interfaces/use-cases/ai/start-dm-video-call.usecase.interface";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";
import { requireUserId } from "../utils/require-user-id";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { AITaskStatus } from "../../domain/enums/AITaskStatus";

@injectable()
export class AIController {
    constructor(
        @inject(USECASE_TOKENS.IHandleAiCommandUseCase)
        private readonly _handleAiCommandUseCase: IHandleAiCommandUseCase,
        @inject(USECASE_TOKENS.IGetAIDashboardUseCase)
        private readonly _getAIDashboardUseCase: IGetAIDashboardUseCase,
        @inject(USECASE_TOKENS.IClearAIDashboardTabUseCase)
        private readonly _clearAIDashboardTabUseCase: IClearAIDashboardTabUseCase,
        @inject(USECASE_TOKENS.IUpdateAITaskStatusUseCase)
        private readonly _updateAITaskStatusUseCase: IUpdateAITaskStatusUseCase,
        @inject(USECASE_TOKENS.IJoinAIScheduleVideoUseCase)
        private readonly _joinAIScheduleVideoUseCase: IJoinAIScheduleVideoUseCase,
        @inject(USECASE_TOKENS.IStartDmVideoCallUseCase)
        private readonly _startDmVideoCallUseCase: IStartDmVideoCallUseCase
    ) {}

    processMessage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const { input, workspaceId, channelId } = req.body;
        const responseText = await this._handleAiCommandUseCase.execute(
            input,
            workspaceId,
            channelId,
            userId
        );
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.AI_PROCESSED, { response: responseText })
        );
    });

    getDashboard = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaceId = String(req.query.workspaceId);
        const data = await this._getAIDashboardUseCase.execute({ userId, workspaceId });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.AI_DASHBOARD_FETCHED, data)
        );
    });

    clearDashboardTab = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const { workspaceId, tab } = req.body;
        const result = await this._clearAIDashboardTabUseCase.execute({
            userId,
            workspaceId,
            tab,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.AI_DASHBOARD_CLEARED, result)
        );
    });

    updateTaskStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const taskId = String(req.params.taskId);
        const workspaceId = String(req.body.workspaceId);
        const status = (req.body.status || AITaskStatus.DONE) as AITaskStatus;
        const task = await this._updateAITaskStatusUseCase.execute({
            taskId,
            userId,
            workspaceId,
            status,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.AI_TASK_UPDATED, task)
        );
    });

    joinScheduleVideo = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const scheduleId = String(req.params.scheduleId);
        const credentials = await this._joinAIScheduleVideoUseCase.execute({
            scheduleId,
            userId,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.AI_VIDEO_JOIN_READY, credentials)
        );
    });

    startDmVideoCall = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const result = await this._startDmVideoCallUseCase.execute({
            userId,
            workspaceId: String(req.body.workspaceId),
            conversationId: String(req.body.conversationId),
        });
        res.status(HttpStatusCode.CREATED).json(
            ApiResponse.success(SuccessMessage.AI_VIDEO_CALL_STARTED, result)
        );
    });
}
