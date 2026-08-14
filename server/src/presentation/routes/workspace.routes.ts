import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { workspaceController } from "../../infrastructure/di/container";
import { validate } from "../middlewares/validate.middleware";
import {
    createWorkspaceBodySchema,
    handleJoinRequestBodySchema,
    inviteCodeParamsSchema,
    joinWorkspaceBodySchema,
    sendInviteBodySchema,
    updateWorkspaceBodySchema,
    workspaceIdParamsSchema,
    workspaceMemberParamsSchema,
    workspaceMembersQuerySchema,
} from "../validators/workspace.schema";

const router = Router();

router.use(authMiddleware);

router.post("/", validate({ body: createWorkspaceBodySchema }), workspaceController.create);
router.post("/join", validate({ body: joinWorkspaceBodySchema }), workspaceController.join);
router.get(
    "/verify/:code",
    validate({ params: inviteCodeParamsSchema }),
    workspaceController.verifyInviteCode
);

router.get("/me", workspaceController.getUserWorkspaces);
router.get("/public", workspaceController.getPublicWorkspaces);

router.get(
    "/:id/members",
    validate({ params: workspaceIdParamsSchema, query: workspaceMembersQuerySchema }),
    workspaceController.getWorkspaceMembers
);
router.post(
    "/:id/requests",
    validate({ params: workspaceIdParamsSchema, body: handleJoinRequestBodySchema }),
    workspaceController.handleJoinRequest
);
router.post(
    "/:id/send-invite",
    validate({ params: workspaceIdParamsSchema, body: sendInviteBodySchema }),
    workspaceController.sendInviteEmail
);
router.delete(
    "/:id/members/:userId",
    validate({ params: workspaceMemberParamsSchema }),
    workspaceController.removeMember
);
router.patch(
    "/:id/members/:userId/block",
    validate({ params: workspaceMemberParamsSchema }),
    workspaceController.blockMember
);
router.put(
    "/:id",
    validate({ params: workspaceIdParamsSchema, body: updateWorkspaceBodySchema }),
    workspaceController.update
);
router.patch(
    "/:id/invite-code",
    validate({ params: workspaceIdParamsSchema }),
    workspaceController.regenerateInviteCode
);
router.delete(
    "/:id",
    validate({ params: workspaceIdParamsSchema }),
    workspaceController.delete
);
router.patch(
    "/:id/members/:userId/unblock",
    validate({ params: workspaceMemberParamsSchema }),
    workspaceController.unblockMember
);

export default router;
