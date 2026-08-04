import { NextFunction, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { IGetPlansUseCase } from "../../application/interfaces/use-cases/plan/get-plans.usecase.interface";
import type { IGetAllPlansUseCase } from "../../application/interfaces/use-cases/plan/get-all-plans.usecase.interface";
import type { ICreatePlanUseCase } from "../../application/interfaces/use-cases/plan/create-plan.usecase.interface";
import type { ITogglePlanStatusUseCase } from "../../application/interfaces/use-cases/plan/toggle-plan-status.usecase.interface";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { AppError } from "../../domain/errors/AppError";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class PlanController {
    constructor(
        @inject(USECASE_TOKENS.IGetPlansUseCase) private readonly _getPlansUseCase: IGetPlansUseCase,
        @inject(USECASE_TOKENS.IGetAllPlansUseCase) private readonly _getAllPlansUseCase: IGetAllPlansUseCase,
        @inject(USECASE_TOKENS.ICreatePlanUseCase) private readonly _createPlanUseCase: ICreatePlanUseCase,
        @inject(USECASE_TOKENS.ITogglePlanStatusUseCase) private readonly _togglePlanStatusUseCase: ITogglePlanStatusUseCase
    ) {}

    public getPlans = catchAsync(async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
        const plans = await this._getPlansUseCase.execute();
        const response = ApiResponse.success(SuccessMessage.PLANS_FETCHED, plans);
        res.status(HttpStatusCode.OK).json(response);
    });

    public getAllPlans = catchAsync(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
        this.assertAdmin(req);
        const plans = await this._getAllPlansUseCase.execute();
        const response = ApiResponse.success(SuccessMessage.PLANS_FETCHED, plans);
        res.status(HttpStatusCode.OK).json(response);
    });

    public createPlan = catchAsync(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
        this.assertAdmin(req);
        const plan = await this._createPlanUseCase.execute({
            ...req.body,
            createdBy: req.user!.id,
        });
        const response = ApiResponse.success(SuccessMessage.PLAN_CREATED, plan);
        res.status(HttpStatusCode.CREATED).json(response);
    });

    public togglePlanStatus = catchAsync(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
        this.assertAdmin(req);
        const planId = req.params.id as string;
        const plan = await this._togglePlanStatusUseCase.execute({
            planId,
            isActive: req.body.isActive,
        });
        const response = ApiResponse.success(SuccessMessage.PLAN_STATUS_UPDATED, plan);
        res.status(HttpStatusCode.OK).json(response);
    });

    private assertAdmin(req: AuthenticatedRequest): void {
        if (!req.user?.id || req.user.role !== "admin") {
            throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
        }
    }
}
