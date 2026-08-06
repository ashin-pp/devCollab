import { Router } from "express";
import { paymentController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/create-order", paymentController.createOrder);
router.post("/verify", paymentController.verify);
router.post("/record-attempt", paymentController.recordAttempt);
router.get("/history", paymentController.history);

export const paymentRoutes = router;
