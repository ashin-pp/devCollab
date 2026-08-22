import { Router } from "express";
import { adminController, planController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate.middleware";
import {
    createAdminBodySchema,
    emailBodySchema,
    loginBodySchema,
    resetPasswordBodySchema,
    verifyOtpBodySchema,
} from "../validators/auth.schema";
import {
    adminDashboardQuerySchema,
    adminIdParamsSchema,
    adminMemberStatusBodySchema,
    adminMemberStatusParamsSchema,
    adminSalesQuerySchema,
    adminUsersQuerySchema,
    adminWalletQuerySchema,
    adminWorkspaceMembersQuerySchema,
    adminWorkspaceStatusBodySchema,
    adminWorkspacesQuerySchema,
} from "../validators/admin.schema";
import { createPlanBodySchema, planIdParamsSchema, updatePlanBodySchema } from "../validators/plan.schema";

const adminRouter = Router();

adminRouter.post("/create", validate({ body: createAdminBodySchema }), adminController.createAdmin);
adminRouter.post("/login", validate({ body: loginBodySchema }), adminController.login);
adminRouter.post("/forgot-password", validate({ body: emailBodySchema }), adminController.forgotPassword);
adminRouter.post("/verify-reset-otp", validate({ body: verifyOtpBodySchema }), adminController.verifyResetOtp);
adminRouter.post("/reset-password", validate({ body: resetPasswordBodySchema }), adminController.resetPassword);
adminRouter.post("/logout", adminController.logout);
adminRouter.get("/refresh", adminController.refresh);

adminRouter.get(
    "/dashboard",
    validate({ query: adminDashboardQuerySchema }),
    adminController.getDashboardStats
);
adminRouter.get(
    "/sales/pdf",
    validate({ query: adminSalesQuerySchema }),
    adminController.downloadSalesReportPdf
);
adminRouter.get(
    "/sales",
    validate({ query: adminSalesQuerySchema }),
    adminController.getSalesReport
);
adminRouter.get(
    "/wallet",
    validate({ query: adminWalletQuerySchema }),
    adminController.getWallet
);

adminRouter.get(
    "/users",
    validate({ query: adminUsersQuerySchema }),
    adminController.getUsers
);
adminRouter.patch(
    "/users/:id/status",
    validate({ params: adminIdParamsSchema }),
    adminController.toggleUserStatus
);

adminRouter.get(
    "/workspaces",
    validate({ query: adminWorkspacesQuerySchema }),
    adminController.getWorkspaces
);
adminRouter.patch(
    "/workspaces/:id/status",
    validate({
        params: adminIdParamsSchema,
        body: adminWorkspaceStatusBodySchema,
    }),
    adminController.toggleWorkspaceStatus
);
adminRouter.get(
    "/workspaces/:id/members",
    validate({ params: adminIdParamsSchema, query: adminWorkspaceMembersQuerySchema }),
    adminController.getWorkspaceMembers
);
adminRouter.patch(
    "/workspaces/:workspaceId/members/:userId/status",
    validate({
        params: adminMemberStatusParamsSchema,
        body: adminMemberStatusBodySchema,
    }),
    adminController.updateWorkspaceMemberStatus
);

adminRouter.get("/plans", authMiddleware, planController.getAllPlans);
adminRouter.post(
    "/plans",
    authMiddleware,
    validate({ body: createPlanBodySchema }),
    planController.createPlan
);
adminRouter.put(
    "/plans/:id",
    authMiddleware,
    validate({ params: planIdParamsSchema, body: updatePlanBodySchema }),
    planController.updatePlan
);
adminRouter.delete(
    "/plans/:id",
    authMiddleware,
    validate({ params: planIdParamsSchema }),
    planController.deletePlan
);

export { adminRouter };
