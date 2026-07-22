import { NextFunction, Request, Response } from "express";
import { inject, injectable } from 'tsyringe';
import type { IHandleAiCommandUseCase } from "../../application/interfaces/use-cases/ai/handle-ai-command.usecase.interface";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class AIController {
    constructor(
        @inject(USECASE_TOKENS.IHandleAiCommandUseCase) private _handleAiCommandUseCase: IHandleAiCommandUseCase
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
}
