import { Router } from "express";
import { adminController } from "../../container";

const adminRouter = Router();

adminRouter.post("/create", adminController.createAdmin);
adminRouter.post("/login", adminController.login);
adminRouter.post("/forgot-password", adminController.forgotPassword);
adminRouter.post("/reset-password", adminController.resetPassword);
adminRouter.post("/logout", adminController.logout);

export { adminRouter };
