import { injectable } from "tsyringe";
import type {
    AdminPaymentPage,
    AdminPaymentQuery,
    AdminPaymentRow,
    IPaymentTransactionRepository,
    PaymentHistoryPage,
    PaymentHistoryQuery,
    PaymentRevenueStats,
    RevenueDayBucket,
} from "../../../application/interfaces/repositories/payment-transaction.repository.interface";
import { PaymentTransaction } from "../../../domain/entities/payment-transaction.entity";
import {
    PaymentTransactionMapper,
    resolveRefId,
} from "../mappers/payment-transaction.mapper";
import {
    PaymentTransactionModel,
    type IPaymentTransactionModel,
} from "../models/payment-transaction.model";

@injectable()
export class PaymentTransactionRepository implements IPaymentTransactionRepository {
    private readonly _mapper = new PaymentTransactionMapper();

    async create(transaction: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
        const doc = new PaymentTransactionModel(this._mapper.toPersistence(transaction));
        const saved = await doc.save();
        return this._mapper.toDomain(saved);
    }

    async findByOrderId(orderId: string): Promise<PaymentTransaction | null> {
        const doc = await PaymentTransactionModel.findOne({ razorpay_order_id: orderId });
        return doc ? this._mapper.toDomain(doc) : null;
    }

    async findByUserIdPaginated(
        userId: string,
        query: PaymentHistoryQuery
    ): Promise<PaymentHistoryPage> {
        const filter: Record<string, unknown> = { user_id: userId };
        if (query.status) {
            filter.status = query.status;
        }
        if (query.planName?.trim()) {
            filter.plan_name = new RegExp(`^${escapeRegex(query.planName.trim())}$`, "i");
        }

        const skip = (query.page - 1) * query.limit;
        const [docs, total, planNameDocs] = await Promise.all([
            PaymentTransactionModel.find(filter)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(query.limit),
            PaymentTransactionModel.countDocuments(filter),
            PaymentTransactionModel.distinct("plan_name", { user_id: userId }),
        ]);

        return {
            items: docs.map((doc) => this._mapper.toDomain(doc)),
            total,
            planNames: (planNameDocs as string[]).filter(Boolean).sort((a, b) => a.localeCompare(b)),
        };
    }

    async findAllPaginatedForAdmin(query: AdminPaymentQuery): Promise<AdminPaymentPage> {
        const filter = buildAdminFilter(query);
        const skip = (query.page - 1) * query.limit;

        const [docs, total, planNameDocs] = await Promise.all([
            PaymentTransactionModel.find(filter)
                .populate("user_id", "name email")
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(query.limit),
            PaymentTransactionModel.countDocuments(filter),
            PaymentTransactionModel.distinct("plan_name"),
        ]);

        return {
            items: docs.map((doc) => toAdminRow(doc, this._mapper)),
            total,
            planNames: (planNameDocs as string[]).filter(Boolean).sort((a, b) => a.localeCompare(b)),
        };
    }

    async getRevenueStats(): Promise<PaymentRevenueStats> {
        const [successAgg, failedCount, cancelledCount] = await Promise.all([
            PaymentTransactionModel.aggregate<{ _id: string; total: number; count: number }>([
                { $match: { status: "success" } },
                {
                    $group: {
                        _id: "$currency",
                        total: { $sum: "$amount" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
            ]),
            PaymentTransactionModel.countDocuments({ status: "failed" }),
            PaymentTransactionModel.countDocuments({ status: "cancelled" }),
        ]);

        const primary = successAgg[0];
        return {
            totalRevenue: primary?.total ?? 0,
            successCount: successAgg.reduce((sum, row) => sum + row.count, 0),
            failedCount,
            cancelledCount,
            currency: (primary?._id || "INR").toUpperCase(),
        };
    }

    async getRevenueByDay(range: { from: Date; to: Date }): Promise<RevenueDayBucket[]> {
        const from = startOfDayUtc(range.from);
        let to = startOfDayUtc(range.to);
        if (to.getTime() < from.getTime()) {
            to = from;
        }

        const maxSpanMs = 90 * 24 * 60 * 60 * 1000;
        if (to.getTime() - from.getTime() > maxSpanMs) {
            to = addDaysUtc(from, 89);
        }

        const dayCount =
            Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        const endExclusive = addDaysUtc(to, 1);

        const rows = await PaymentTransactionModel.aggregate<{
            _id: string;
            amount: number;
            count: number;
        }>([
            {
                $match: {
                    status: "success",
                    created_at: { $gte: from, $lt: endExclusive },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
                    },
                    amount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const byDate = new Map(rows.map((row) => [row._id, row]));
        const buckets: RevenueDayBucket[] = [];
        for (let i = 0; i < dayCount; i++) {
            const day = addDaysUtc(from, i);
            const key = formatDateKey(day);
            const hit = byDate.get(key);
            buckets.push({
                date: key,
                amount: hit?.amount ?? 0,
                count: hit?.count ?? 0,
            });
        }
        return buckets;
    }

    async getRecentForAdmin(limit: number): Promise<AdminPaymentRow[]> {
        const docs = await PaymentTransactionModel.find({})
            .populate("user_id", "name email")
            .sort({ created_at: -1 })
            .limit(Math.min(50, Math.max(1, limit)));
        return docs.map((doc) => toAdminRow(doc, this._mapper));
    }
}

function buildAdminFilter(query: AdminPaymentQuery): Record<string, unknown> {
    const filter: Record<string, unknown> = {};
    if (query.status) {
        filter.status = query.status;
    }
    if (query.planName?.trim()) {
        filter.plan_name = new RegExp(`^${escapeRegex(query.planName.trim())}$`, "i");
    }
    if (query.from || query.to) {
        const createdAt: Record<string, Date> = {};
        if (query.from) createdAt.$gte = query.from;
        if (query.to) createdAt.$lte = query.to;
        filter.created_at = createdAt;
    }
    return filter;
}

function toAdminRow(
    doc: IPaymentTransactionModel,
    mapper: PaymentTransactionMapper
): AdminPaymentRow {
    const populated = doc.user_id as unknown as {
        _id?: unknown;
        name?: string;
        email?: string;
    } | null;

    // When the referenced user was deleted, populate sets user_id to null —
    // recover the original ObjectId via populated().
    const userId =
        resolveRefId(doc.user_id) ||
        resolveRefId(doc.populated("user_id"));

    const userName =
        populated && typeof populated === "object" && "name" in populated
            ? populated.name
            : undefined;
    const userEmail =
        populated && typeof populated === "object" && "email" in populated
            ? populated.email
            : undefined;

    const base = mapper.toDomain(doc);
    return {
        ...base,
        userId: userId || base.userId,
        userName: userName ?? (userId ? "Deleted user" : undefined),
        userEmail,
    };
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function startOfDayUtc(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDaysUtc(date: Date, days: number): Date {
    const next = new Date(date.getTime());
    next.setUTCDate(next.getUTCDate() + days);
    return next;
}

function formatDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}
