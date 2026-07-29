import { Router } from "express";
import { pollController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/", pollController.create);
router.post("/:id/vote", pollController.vote);
router.patch("/:id/close", pollController.close);
router.get("/workspace/:workspaceId", pollController.getWorkspacePolls);
router.get("/channel/:channelId", pollController.getChannelPolls);
router.delete("/:id", pollController.delete);

export default router;
