import { WalletLedgerEntry } from "../../../domain/entities/wallet-ledger-entry.entity";
import type { IWalletLedgerEntryModel } from "../models/wallet-ledger-entry.model";

export class WalletLedgerEntryMapper {
    toDomain(persistence: IWalletLedgerEntryModel): WalletLedgerEntry {
        return new WalletLedgerEntry(
            resolveRefId(persistence.user_id),
            resolveRefId(persistence.plan_id),
            persistence.plan_name,
            persistence.amount,
            persistence.currency,
            persistence.type,
            persistence.razorpay_order_id,
            persistence.razorpay_payment_id,
            persistence.description,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at,
            persistence.updated_at
        );
    }

    toPersistence(domain: Partial<WalletLedgerEntry>): Record<string, unknown> {
        return Object.fromEntries(
            Object.entries({
                user_id: domain.userId,
                plan_id: domain.planId,
                plan_name: domain.planName,
                amount: domain.amount,
                currency: domain.currency,
                type: domain.type,
                razorpay_order_id: domain.razorpayOrderId,
                razorpay_payment_id: domain.razorpayPaymentId,
                description: domain.description,
            }).filter(([, value]) => value !== undefined)
        );
    }
}

function resolveRefId(value: unknown): string {
    if (value == null) return "";
    if (typeof value === "object" && value !== null && "_id" in value) {
        const id = (value as { _id?: unknown })._id;
        return id == null ? "" : String(id);
    }
    return String(value);
}
