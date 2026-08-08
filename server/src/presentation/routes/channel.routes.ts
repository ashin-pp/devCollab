import { Router } from "express";
import { channelController, messageController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { checkChannelActive } from "../middlewares/channelMiddleware";
import { validate } from "../middlewares/validate.middleware";
import {
    addChannelMembersBodySchema,
    channelMemberParamsSchema,
    channelParamsSchema,
    channelRequestParamsSchema,
    createChannelBodySchema,
    markChannelReadBodySchema,
    messagesQuerySchema,
    sendMessageBodySchema,
    threadParamsSchema,
    updateChannelBodySchema,
    updateChannelRequestBodySchema,
    workspaceIdParamSchema,
} from "../validators/channel.schema";

const router = Router();

router.post(
    "/:workspaceId/channels",
    authMiddleware,
    validate({ params: workspaceIdParamSchema, body: createChannelBodySchema }),
    channelController.createChannel
);
router.get(
    "/:workspaceId/channels",
    authMiddleware,
    validate({ params: workspaceIdParamSchema }),
    channelController.getWorkspaceChannels
);
router.patch(
    "/:workspaceId/channels/:channelId",
    authMiddleware,
    validate({ params: channelParamsSchema, body: updateChannelBodySchema }),
    channelController.updateChannel
);
router.delete(
    "/:workspaceId/channels/:channelId",
    authMiddleware,
    validate({ params: channelParamsSchema }),
    channelController.deleteChannel
);

router.get(
    "/:workspaceId/channels/:channelId/members",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelParamsSchema }),
    channelController.getChannelMembers
);
router.post(
    "/:workspaceId/channels/:channelId/members",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelParamsSchema, body: addChannelMembersBodySchema }),
    channelController.addChannelMembers
);
router.delete(
    "/:workspaceId/channels/:channelId/members/:memberId",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelMemberParamsSchema }),
    channelController.removeChannelMember
);
router.patch(
    "/:workspaceId/channels/:channelId/members/:memberId/block",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelMemberParamsSchema }),
    channelController.blockChannelMember
);
router.patch(
    "/:workspaceId/channels/:channelId/members/:memberId/unblock",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelMemberParamsSchema }),
    channelController.unblockChannelMember
);
router.get(
    "/:workspaceId/channels/:channelId/blocked",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelParamsSchema }),
    channelController.getBlockedChannelMembers
);
router.post(
    "/:workspaceId/channels/:channelId/leave",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelParamsSchema }),
    channelController.leaveChannel
);
router.post(
    "/:workspaceId/channels/:channelId/join",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelParamsSchema }),
    channelController.joinChannel
);
router.get(
    "/:workspaceId/channels/:channelId/requests",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelParamsSchema }),
    channelController.getChannelRequests
);
router.patch(
    "/:workspaceId/channels/:channelId/requests/:userId",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelRequestParamsSchema, body: updateChannelRequestBodySchema }),
    channelController.updateChannelRequest
);

router.post(
    "/:workspaceId/channels/:channelId/read",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelParamsSchema, body: markChannelReadBodySchema }),
    channelController.markChannelAsRead
);
router.get(
    "/:workspaceId/channels/unread-counts",
    authMiddleware,
    validate({ params: workspaceIdParamSchema }),
    channelController.getUnreadCounts
);

router.post(
    "/:workspaceId/channels/:channelId/messages",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelParamsSchema, body: sendMessageBodySchema }),
    messageController.sendMessage
);
router.get(
    "/:workspaceId/channels/:channelId/messages",
    authMiddleware,
    checkChannelActive,
    validate({ params: channelParamsSchema, query: messagesQuerySchema }),
    messageController.getChannelMessages
);
router.get(
    "/:workspaceId/channels/:channelId/messages/:messageId/thread",
    authMiddleware,
    checkChannelActive,
    validate({ params: threadParamsSchema }),
    messageController.getThreadReplies
);

export default router;
