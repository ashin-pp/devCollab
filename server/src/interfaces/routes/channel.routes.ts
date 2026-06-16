import { Router } from 'express';
import { channelController, messageController } from '../../container';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Channel Routes
router.post('/:workspaceId/channels', authMiddleware, channelController.createChannel);
router.get('/:workspaceId/channels', authMiddleware, channelController.getWorkspaceChannels);

// Message Routes
router.post('/:workspaceId/channels/:channelId/messages', authMiddleware, messageController.sendMessage);
router.get('/:workspaceId/channels/:channelId/messages', authMiddleware, messageController.getChannelMessages);

export default router;
