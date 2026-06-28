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
router.patch('/:workspaceId/channels/:channelId/members/:memberId/block', authMiddleware, channelController.blockChannelMember);
router.patch('/:workspaceId/channels/:channelId/members/:memberId/unblock', authMiddleware, channelController.unblockChannelMember);
router.get('/:workspaceId/channels/:channelId/blocked', authMiddleware, channelController.getBlockedChannelMembers);
router.post('/:workspaceId/channels/:channelId/leave', authMiddleware, channelController.leaveChannel);
router.post('/:workspaceId/channels/:channelId/join', authMiddleware, channelController.joinChannel);
router.get('/:workspaceId/channels/:channelId/requests', authMiddleware, channelController.getChannelRequests);
router.patch('/:workspaceId/channels/:channelId/requests/:userId', authMiddleware, channelController.updateChannelRequest);

// Unread Messages
router.post('/:workspaceId/channels/:channelId/read', authMiddleware, channelController.markChannelAsRead);
router.get('/:workspaceId/channels/unread-counts', authMiddleware, channelController.getUnreadCounts);

// Message Routes
router.post('/:workspaceId/channels/:channelId/messages', authMiddleware, messageController.sendMessage);
router.get('/:workspaceId/channels/:channelId/messages', authMiddleware, messageController.getChannelMessages);

export default router;
