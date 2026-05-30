import { Router } from "express";
import { authController } from "../../container";

const authRouter = Router();

authRouter.post("/register", authController.register);

export { authRouter };
