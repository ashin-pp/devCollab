import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { HandleAiCommandUseCase } from "../../application/use-cases/ai/handle-ai-command.usecase";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class AIController {
    constructor(
        @inject(HandleAiCommandUseCase) private _handleAiCommandUseCase: HandleAiCommandUseCase
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
