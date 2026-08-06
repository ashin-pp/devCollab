import { Router } from "express";
import { adminController, planController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";

const adminRouter = Router();

adminRouter.post("/create", adminController.createAdmin);
adminRouter.post("/login", adminController.login);
adminRouter.post("/forgot-password", adminController.forgotPassword);
adminRouter.post("/verify-reset-otp", adminController.verifyResetOtp);
adminRouter.post("/reset-password", adminController.resetPassword);
adminRouter.post("/logout", adminController.logout);
adminRouter.get("/refresh", adminController.refresh);

adminRouter.get("/users", adminController.getUsers);
adminRouter.patch("/users/:id/status", adminController.toggleUserStatus);

adminRouter.get("/workspaces", adminController.getWorkspaces);
adminRouter.patch("/workspaces/:id/status", adminController.toggleWorkspaceStatus);
adminRouter.get("/workspaces/:id/members", adminController.getWorkspaceMembers);
adminRouter.patch("/workspaces/:workspaceId/members/:userId/status", adminController.updateWorkspaceMemberStatus);

adminRouter.get("/plans", authMiddleware, planController.getAllPlans);
adminRouter.post("/plans", authMiddleware, planController.createPlan);
adminRouter.put("/plans/:id", authMiddleware, planController.updatePlan);
adminRouter.delete("/plans/:id", authMiddleware, planController.deletePlan);

export { adminRouter };
