import { Router } from "express";
import { pollController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate.middleware";
import {
    channelPollParamsSchema,
    createPollBodySchema,
    pollIdParamsSchema,
    votePollBodySchema,
    workspacePollParamsSchema,
} from "../validators/poll.schema";

const router = Router();

router.use(authMiddleware);

router.post("/", validate({ body: createPollBodySchema }), pollController.create);
router.post(
    "/:id/vote",
    validate({ params: pollIdParamsSchema, body: votePollBodySchema }),
    pollController.vote
);
router.patch(
    "/:id/close",
    validate({ params: pollIdParamsSchema }),
    pollController.close
);
router.get(
    "/workspace/:workspaceId",
    validate({ params: workspacePollParamsSchema }),
    pollController.getWorkspacePolls
);
router.get(
    "/channel/:channelId",
    validate({ params: channelPollParamsSchema }),
    pollController.getChannelPolls
);
router.delete(
    "/:id",
    validate({ params: pollIdParamsSchema }),
    pollController.delete
);

export default router;
