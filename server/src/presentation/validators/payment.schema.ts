import { z } from "zod";
import { nonEmptyString, objectIdSchema } from "./common.schema";

export const createPaymentOrderBodySchema = z.object({
    planId: objectIdSchema,
});

export const verifyPaymentBodySchema = z.object({
    razorpay_order_id: nonEmptyString("Order id is required"),
    razorpay_payment_id: nonEmptyString("Payment id is required"),
    razorpay_signature: nonEmptyString("Signature is required"),
    planId: objectIdSchema,
});

export const recordPaymentAttemptBodySchema = z.object({
    planId: objectIdSchema,
    razorpayOrderId: nonEmptyString("Order id is required"),
    status: z.enum(["failed", "cancelled"]),
});
