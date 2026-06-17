import { Router } from 'express';
import { channelController, messageController } from '../../container';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Channel Routes
router.post('/:workspaceId/channels', authMiddleware, channelController.createChannel);
router.get('/:workspaceId/channels', authMiddleware, channelController.getWorkspaceChannels);
router.patch('/:workspaceId/channels/:channelId', authMiddleware, channelController.updateChannel);
router.delete('/:workspaceId/channels/:channelId', authMiddleware, channelController.deleteChannel);

// Channel Member Routes
router.get('/:workspaceId/channels/:channelId/members', authMiddleware, channelController.getChannelMembers);
router.post('/:workspaceId/channels/:channelId/members', authMiddleware, channelController.addChannelMembers);
router.delete('/:workspaceId/channels/:channelId/members/:memberId', authMiddleware, channelController.removeChannelMember);
router.post('/:workspaceId/channels/:channelId/leave', authMiddleware, channelController.leaveChannel);
router.post('/:workspaceId/channels/:channelId/join', authMiddleware, channelController.joinChannel);
router.get('/:workspaceId/channels/:channelId/requests', authMiddleware, channelController.getChannelRequests);
router.patch('/:workspaceId/channels/:channelId/requests/:userId', authMiddleware, channelController.updateChannelRequest);

// Message Routes
router.post('/:workspaceId/channels/:channelId/messages', authMiddleware, messageController.sendMessage);
router.get('/:workspaceId/channels/:channelId/messages', authMiddleware, messageController.getChannelMessages);

export default router;
