import { NextFunction, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { IGetPlansUseCase } from "../../application/interfaces/use-cases/plan/get-plans.usecase.interface";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class PlanController {
    constructor(
        @inject(USECASE_TOKENS.IGetPlansUseCase) private readonly _getPlansUseCase: IGetPlansUseCase
    ) {}

    public getPlans = catchAsync(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
        const plans = await this._getPlansUseCase.execute();
        const response = ApiResponse.success(SuccessMessage.PLANS_FETCHED, plans);
        res.status(HttpStatusCode.OK).json(response);
    });
}
