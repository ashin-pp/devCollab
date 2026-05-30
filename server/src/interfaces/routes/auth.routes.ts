import { Router } from "express";
import { authController } from "../../container";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/send-otp", authController.sendOtp);
authRouter.post("/verify-otp", authController.verifyOtp);

export { authRouter };
