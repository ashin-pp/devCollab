import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { workspaceController } from "../../infrastructure/di/container";

const router = Router();

// Apply auth middleware to all workspace routes
router.use(authMiddleware);

// Workspace creation, joining, and verification routes
router.post("/", workspaceController.create);
router.post("/join", workspaceController.join);
router.get("/verify/:code", workspaceController.verifyInviteCode);

// Fetching workspaces
router.get("/me", workspaceController.getUserWorkspaces);
router.get("/public", workspaceController.getPublicWorkspaces);

// Workspace members and join requests management
router.get("/:id/members", workspaceController.getWorkspaceMembers);
router.post("/:id/requests", workspaceController.handleJoinRequest);
router.post("/:id/send-invite", workspaceController.sendInviteEmail);
router.delete("/:id/members/:userId", workspaceController.removeMember);
router.patch("/:id/members/:userId/block", workspaceController.blockMember);
// Workspace settings management
router.put("/:id", workspaceController.update);
router.patch("/:id/invite-code", workspaceController.regenerateInviteCode);
router.delete("/:id", workspaceController.delete);

router.patch("/:id/members/:userId/unblock", workspaceController.unblockMember);

export default router;
