import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { dmController } from "../../infrastructure/di/container";

const router = Router();

// Apply auth middleware to all DM routes
router.use(authMiddleware);

// Start a new conversation or get existing one
router.post('/workspaces/:workspaceId/dm', dmController.startConversation);

// Get all conversations for a user in a workspace
router.get('/workspaces/:workspaceId/dm/conversations', dmController.getConversations);

// Get messages for a specific conversation
router.get('/dm/conversations/:conversationId/messages', dmController.getMessages);

// Send a message
router.post('/dm/conversations/:conversationId/messages', dmController.sendMessage);

// Mark messages as seen
router.post('/dm/conversations/:conversationId/seen', dmController.markAsSeen);

export default router;
