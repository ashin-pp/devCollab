import { Router } from "express";
import { channelController, messageController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { checkChannelActive } from "../middlewares/channelMiddleware";

const router = Router();

// Channel Routes
router.post('/:workspaceId/channels', authMiddleware, channelController.createChannel);
router.get('/:workspaceId/channels', authMiddleware, channelController.getWorkspaceChannels);
router.patch('/:workspaceId/channels/:channelId', authMiddleware, channelController.updateChannel);
router.delete('/:workspaceId/channels/:channelId', authMiddleware, channelController.deleteChannel);

// Channel Member Routes
router.get('/:workspaceId/channels/:channelId/members', authMiddleware, checkChannelActive, channelController.getChannelMembers);
router.post('/:workspaceId/channels/:channelId/members', authMiddleware, checkChannelActive, channelController.addChannelMembers);
router.delete('/:workspaceId/channels/:channelId/members/:memberId', authMiddleware, checkChannelActive, channelController.removeChannelMember);
router.patch('/:workspaceId/channels/:channelId/members/:memberId/block', authMiddleware, checkChannelActive, channelController.blockChannelMember);
router.patch('/:workspaceId/channels/:channelId/members/:memberId/unblock', authMiddleware, checkChannelActive, channelController.unblockChannelMember);
router.get('/:workspaceId/channels/:channelId/blocked', authMiddleware, checkChannelActive, channelController.getBlockedChannelMembers);
router.post('/:workspaceId/channels/:channelId/leave', authMiddleware, checkChannelActive, channelController.leaveChannel);
router.post('/:workspaceId/channels/:channelId/join', authMiddleware, checkChannelActive, channelController.joinChannel);
router.get('/:workspaceId/channels/:channelId/requests', authMiddleware, checkChannelActive, channelController.getChannelRequests);
router.patch('/:workspaceId/channels/:channelId/requests/:userId', authMiddleware, checkChannelActive, channelController.updateChannelRequest);

// Unread Messages
router.post('/:workspaceId/channels/:channelId/read', authMiddleware, checkChannelActive, channelController.markChannelAsRead);
router.get('/:workspaceId/channels/unread-counts', authMiddleware, channelController.getUnreadCounts);

// Message Routes
router.post('/:workspaceId/channels/:channelId/messages', authMiddleware, checkChannelActive, messageController.sendMessage);
router.get('/:workspaceId/channels/:channelId/messages', authMiddleware, checkChannelActive, messageController.getChannelMessages);
router.get('/:workspaceId/channels/:channelId/messages/:messageId/thread', authMiddleware, checkChannelActive, messageController.getThreadReplies);

export default router;
