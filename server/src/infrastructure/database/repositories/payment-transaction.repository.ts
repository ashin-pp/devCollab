import { injectable } from "tsyringe";
import type {
    IPaymentTransactionRepository,
    PaymentHistoryPage,
    PaymentHistoryQuery,
} from "../../../application/interfaces/repositories/payment-transaction.repository.interface";
import { PaymentTransaction } from "../../../domain/entities/payment-transaction.entity";
import { PaymentTransactionMapper } from "../mappers/payment-transaction.mapper";
import { PaymentTransactionModel } from "../models/payment-transaction.model";

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
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
