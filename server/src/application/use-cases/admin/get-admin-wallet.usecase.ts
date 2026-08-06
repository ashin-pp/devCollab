import { inject, injectable } from "tsyringe";
import type { IWalletLedgerRepository } from "../../interfaces/repositories/wallet-ledger.repository.interface";
import type { IGetAdminWalletUseCase } from "../../interfaces/use-cases/admin/get-admin-wallet.usecase.interface";
import { AdminWalletResponseDto } from "../../dtos/admin/response/admin-wallet.response.dto";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetAdminWalletUseCase implements IGetAdminWalletUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWalletLedgerRepository)
        private readonly _walletLedgerRepository: IWalletLedgerRepository
    ) {}

    async execute(params?: { page?: number; limit?: number }): Promise<AdminWalletResponseDto> {
        const page = Math.max(1, params?.page || 1);
        const limit = Math.min(50, Math.max(1, params?.limit || 10));

        const [balance, ledger] = await Promise.all([
            this._walletLedgerRepository.getBalance(),
            this._walletLedgerRepository.findPaginated({ page, limit }),
        ]);

        return {
            balance: balance.balance,
            currency: balance.currency,
            creditCount: balance.creditCount,
            debitCount: balance.debitCount,
            items: ledger.items.map((item) => ({
                id: item.id ?? "",
                userId: item.userId,
                userName: item.userName,
                userEmail: item.userEmail,
                planId: item.planId,
                planName: item.planName,
                amount: item.amount,
                currency: item.currency,
                type: item.type,
                razorpayOrderId: item.razorpayOrderId,
                razorpayPaymentId: item.razorpayPaymentId,
                description: item.description,
                createdAt: (item.createdAt ?? new Date()).toISOString(),
            })),
            page,
            limit,
            total: ledger.total,
            totalPages: Math.max(1, Math.ceil(ledger.total / limit)),
        };
    }
}
