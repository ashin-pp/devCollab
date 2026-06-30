import { Router } from 'express';
import { aiController } from '../../container';

const router = Router();

// Process an AI message (handles commands like @task, @summary, etc.)
// Note: authentication temporarily removed for Thunder Client testing
router.post('/process', aiController.processMessage);

export default router;
