import crypto from "crypto";
import Razorpay from "razorpay";
import { injectable } from "tsyringe";
import type { IPaymentService } from "../../application/interfaces/services/payment.service.interface";
import { envConfig } from "../../config/envConfig";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AppError } from "../../domain/errors/AppError";

@injectable()
export class RazorpayPaymentService implements IPaymentService {
    private readonly _keyId = envConfig.razorpayKeyId.trim();
    private readonly _keySecret = envConfig.razorpayKeySecret.trim();
    private readonly _client: Razorpay | null;

    constructor() {
        this._client =
            this._keyId && this._keySecret
                ? new Razorpay({ key_id: this._keyId, key_secret: this._keySecret })
                : null;
    }

    isConfigured(): boolean {
        return Boolean(this._client && this._keyId && this._keySecret);
    }

    private ensureClient(): Razorpay {
        if (!this._client) {
            throw new AppError(ErrorMessage.PAYMENT_NOT_CONFIGURED, HttpStatusCode.SERVICE_UNAVAILABLE);
        }
        return this._client;
    }

    async createOrder(input: {
        amountPaise: number;
        currency: string;
        receipt: string;
        notes: Record<string, string>;
    }): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
    }> {
        const client = this.ensureClient();
        try {
            const order = await client.orders.create({
                amount: input.amountPaise,
                currency: input.currency,
                receipt: input.receipt.slice(0, 40),
                notes: input.notes,
            });

            return {
                orderId: String(order.id),
                amount: Number(order.amount),
                currency: String(order.currency),
                keyId: this._keyId,
            };
        } catch {
            throw new AppError(ErrorMessage.PAYMENT_ORDER_FAILED, HttpStatusCode.BAD_GATEWAY);
        }
    }

    verifyPaymentSignature(input: {
        orderId: string;
        paymentId: string;
        signature: string;
    }): boolean {
        if (!this._keySecret) return false;
        const payload = `${input.orderId}|${input.paymentId}`;
        const expected = crypto
            .createHmac("sha256", this._keySecret)
            .update(payload)
            .digest("hex");
        return expected === input.signature;
    }

    async fetchOrder(orderId: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        status: string;
        notes: Record<string, string>;
    }> {
        const client = this.ensureClient();
        try {
            const order = await client.orders.fetch(orderId);
            const notesRaw = (order.notes ?? {}) as Record<string, unknown>;
            const notes: Record<string, string> = {};
            for (const [key, value] of Object.entries(notesRaw)) {
                if (value != null) notes[key] = String(value);
            }
            return {
                orderId: String(order.id),
                amount: Number(order.amount),
                currency: String(order.currency),
                status: String(order.status),
                notes,
            };
        } catch {
            throw new AppError(ErrorMessage.PAYMENT_VERIFY_FAILED, HttpStatusCode.BAD_REQUEST);
        }
    }
}
