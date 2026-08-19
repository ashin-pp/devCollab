import { injectable } from "tsyringe";
import type {
    IWalletLedgerRepository,
    WalletBalance,
    WalletLedgerPage,
    WalletLedgerQuery,
    WalletLedgerRow,
} from "../../../application/interfaces/repositories/wallet-ledger.repository.interface";
import { WalletLedgerEntry } from "../../../domain/entities/wallet-ledger-entry.entity";
import { WalletLedgerEntryMapper } from "../mappers/wallet-ledger-entry.mapper";
import {
    WalletLedgerEntryModel,
    type IWalletLedgerEntryModel,
} from "../models/wallet-ledger-entry.model";

@injectable()
export class WalletLedgerRepository implements IWalletLedgerRepository {
    private readonly _mapper = new WalletLedgerEntryMapper();

    async creditIfAbsent(entry: Partial<WalletLedgerEntry>): Promise<WalletLedgerEntry> {
        if (!entry.razorpayOrderId?.trim()) {
            throw new Error("razorpayOrderId is required for wallet credit");
        }

        const existing = await WalletLedgerEntryModel.findOne({
            razorpay_order_id: entry.razorpayOrderId,
        });
        if (existing) {
            return this._mapper.toDomain(existing);
        }

        try {
            const doc = new WalletLedgerEntryModel(
                this._mapper.toPersistence({
                    ...entry,
                    type: "credit",
                    currency: (entry.currency || "INR").toUpperCase(),
                    description:
                        entry.description ||
                        `Plan purchase: ${entry.planName || "Paid plan"}`,
                })
            );
            const saved = await doc.save();
            return this._mapper.toDomain(saved);
        } catch (err: unknown) {
            // Concurrent verify can hit unique index — treat as already credited.
            if (isDuplicateKeyError(err)) {
                const again = await WalletLedgerEntryModel.findOne({
                    razorpay_order_id: entry.razorpayOrderId,
                });
                if (again) return this._mapper.toDomain(again);
            }
            throw err;
        }
    }

    async getBalance(): Promise<WalletBalance> {
        const rows = await WalletLedgerEntryModel.aggregate<{
            _id: string;
            creditTotal: number;
            debitTotal: number;
            creditCount: number;
            debitCount: number;
        }>([
            {
                $group: {
                    _id: "$currency",
                    creditTotal: {
                        $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0] },
                    },
                    debitTotal: {
                        $sum: { $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0] },
                    },
                    creditCount: {
                        $sum: { $cond: [{ $eq: ["$type", "credit"] }, 1, 0] },
                    },
                    debitCount: {
                        $sum: { $cond: [{ $eq: ["$type", "debit"] }, 1, 0] },
                    },
                },
            },
            { $sort: { creditCount: -1 } },
        ]);

        const primary = rows[0];
        return {
            balance: (primary?.creditTotal ?? 0) - (primary?.debitTotal ?? 0),
            currency: (primary?._id || "INR").toUpperCase(),
            creditCount: primary?.creditCount ?? 0,
            debitCount: primary?.debitCount ?? 0,
        };
    }

    async findPaginated(query: WalletLedgerQuery): Promise<WalletLedgerPage> {
        const skip = (query.page - 1) * query.limit;
        const [docs, total] = await Promise.all([
            WalletLedgerEntryModel.find({})
                .populate("user_id", "name email")
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(query.limit),
            WalletLedgerEntryModel.countDocuments({}),
        ]);

        return {
            items: docs.map((doc) => toAdminRow(doc, this._mapper)),
            total,
        };
    }
}

function toAdminRow(
    doc: IWalletLedgerEntryModel,
    mapper: WalletLedgerEntryMapper
): WalletLedgerRow {
    const base = mapper.toDomain(doc);
    const populated = doc.user_id as unknown as { name?: string; email?: string } | null;
    const userName =
        populated && typeof populated === "object" && "name" in populated
            ? populated.name
            : undefined;
    const userEmail =
        populated && typeof populated === "object" && "email" in populated
            ? populated.email
            : undefined;
    return { ...base, userName, userEmail };
}

function isDuplicateKeyError(err: unknown): boolean {
    return (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: number }).code === 11000
    );
}
