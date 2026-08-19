import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { dmController } from "../../infrastructure/di/container";
import { validate } from "../middlewares/validate.middleware";
import {
    conversationParamsSchema,
    dmMessagesQuerySchema,
    sendDmBodySchema,
    startConversationBodySchema,
    startConversationParamsSchema,
} from "../validators/dm.schema";

const router = Router();

router.use(authMiddleware);

router.post(
    "/workspaces/:workspaceId/dm",
    validate({
        params: startConversationParamsSchema,
        body: startConversationBodySchema,
    }),
    dmController.startConversation
);
router.get(
    "/workspaces/:workspaceId/dm/conversations",
    validate({ params: startConversationParamsSchema }),
    dmController.getConversations
);
router.get(
    "/dm/conversations/:conversationId/messages",
    validate({ params: conversationParamsSchema, query: dmMessagesQuerySchema }),
    dmController.getMessages
);
router.post(
    "/dm/conversations/:conversationId/messages",
    validate({ params: conversationParamsSchema, body: sendDmBodySchema }),
    dmController.sendMessage
);
router.post(
    "/dm/conversations/:conversationId/seen",
    validate({ params: conversationParamsSchema }),
    dmController.markAsSeen
);

export default router;
