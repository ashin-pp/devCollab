import { Router } from "express";
import { authController } from "../../container";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/send-otp", authController.sendOtp);
authRouter.post("/verify-otp", authController.verifyOtp);
authRouter.post("/login", authController.login);
authRouter.post("/google", authController.googleAuth);

authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);

export { authRouter };
