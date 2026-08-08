import { Router } from "express";
import { paymentController } from "../../infrastructure/di/container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate.middleware";
import {
    createPaymentOrderBodySchema,
    recordPaymentAttemptBodySchema,
    verifyPaymentBodySchema,
} from "../validators/payment.schema";
import { paginationQuerySchema } from "../validators/common.schema";
import { z } from "zod";

const paymentHistoryQuerySchema = paginationQuerySchema.extend({
    status: z.enum(["success", "failed", "cancelled"]).optional(),
    planName: z.string().optional(),
});

const router = Router();

router.use(authMiddleware);

router.post(
    "/create-order",
    validate({ body: createPaymentOrderBodySchema }),
    paymentController.createOrder
);
router.post("/verify", validate({ body: verifyPaymentBodySchema }), paymentController.verify);
router.post(
    "/record-attempt",
    validate({ body: recordPaymentAttemptBodySchema }),
    paymentController.recordAttempt
);
router.get(
    "/history",
    validate({ query: paymentHistoryQuerySchema }),
    paymentController.history
);

export const paymentRoutes = router;
