import { Router } from "express";
import { authController } from "../../infrastructure/di/container";
import { validate } from "../middlewares/validate.middleware";
import {
    emailBodySchema,
    googleAuthBodySchema,
    loginBodySchema,
    registerBodySchema,
    resetPasswordBodySchema,
    verifyOtpBodySchema,
} from "../validators/auth.schema";

const authRouter = Router();

authRouter.post("/register", validate({ body: registerBodySchema }), authController.register);
authRouter.post("/send-otp", validate({ body: emailBodySchema }), authController.sendOtp);
authRouter.post("/verify-otp", validate({ body: verifyOtpBodySchema }), authController.verifyOtp);
authRouter.post("/login", validate({ body: loginBodySchema }), authController.login);
authRouter.post("/google", validate({ body: googleAuthBodySchema }), authController.googleAuth);
authRouter.post("/logout", authController.logout);
authRouter.get("/refresh", authController.refresh);
authRouter.post("/forgot-password", validate({ body: emailBodySchema }), authController.forgotPassword);
authRouter.post("/verify-reset-otp", validate({ body: verifyOtpBodySchema }), authController.verifyResetOtp);
authRouter.post("/reset-password", validate({ body: resetPasswordBodySchema }), authController.resetPassword);

export { authRouter };
