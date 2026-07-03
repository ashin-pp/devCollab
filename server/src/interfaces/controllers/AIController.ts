import { Request, Response } from 'express';
import { HandleAiCommandUseCase } from '../../application/use-cases/ai/HandleAiCommandUseCase';

export class AIController {
    constructor(private handleAiCommandUseCase: HandleAiCommandUseCase) {}

    processMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const { input, workspaceId, channelId } = req.body;
            // req.user is usually set by your auth middleware
            // Fallback to a valid 24-hex ObjectId if testing without auth
            const userId = (req as Request & { user?: { id: string } }).user?.id || "000000000000000000000000";

            if (!input || !workspaceId || !channelId || !userId) {
                res.status(400).json({ success: false, message: 'Missing required fields' });
                return;
            }

            const response = await this.handleAiCommandUseCase.execute(input, workspaceId, channelId, userId);

            res.status(200).json({ success: true, data: { response } });
        } catch (error) {
            console.error('Error in AIController:', error);
            res.status(500).json({ success: false, message: 'Internal server error processing AI command' });
        }
    };
}
