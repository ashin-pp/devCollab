import { inject, injectable } from "tsyringe";
import type { IPaymentTransactionRepository } from "../../interfaces/repositories/payment-transaction.repository.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type { IWorkspaceRepository } from "../../interfaces/repositories/workspace.repository.interface";
import type {
    GetAdminDashboardStatsParams,
    IGetAdminDashboardStatsUseCase,
} from "../../interfaces/use-cases/admin/get-admin-dashboard-stats.usecase.interface";
import { AdminDashboardStatsResponseDto } from "../../dtos/admin/response/admin-dashboard-stats.response.dto";
import { UserStatus } from "../../../domain/enums/UserStatus";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetAdminDashboardStatsUseCase implements IGetAdminDashboardStatsUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private readonly _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository)
        private readonly _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IPaymentTransactionRepository)
        private readonly _paymentTransactionRepository: IPaymentTransactionRepository
    ) {}

    async execute(payload?: GetAdminDashboardStatsParams): Promise<AdminDashboardStatsResponseDto> {
        const { from, to } = resolveChartRange(payload);

        const [
            usersPage,
            activeUsersPage,
            workspacesPage,
            activeWorkspacesPage,
            revenue,
            revenueByDay,
            recentPayments,
        ] = await Promise.all([
            this._userRepository.findPaginated({}, 1, 1),
            this._userRepository.findPaginated({ status: UserStatus.ACTIVE }, 1, 1),
            this._workspaceRepository.findPaginated({}, 1, 1),
            this._workspaceRepository.findPaginated({ is_active: true }, 1, 1),
            this._paymentTransactionRepository.getRevenueStats(),
            this._paymentTransactionRepository.getRevenueByDay({ from, to }),
            this._paymentTransactionRepository.getRecentForAdmin(8),
        ]);

        return {
            totalUsers: usersPage.total,
            activeUsers: activeUsersPage.total,
            totalWorkspaces: workspacesPage.total,
            activeWorkspaces: activeWorkspacesPage.total,
            totalRevenue: revenue.totalRevenue,
            currency: revenue.currency,
            successPayments: revenue.successCount,
            failedPayments: revenue.failedCount,
            cancelledPayments: revenue.cancelledCount,
            revenueByDay,
            recentPayments: recentPayments.map((item) => ({
                id: item.id ?? "",
                planName: item.planName,
                amount: item.amount,
                currency: item.currency,
                status: item.status,
                userName: item.userName,
                userEmail: item.userEmail,
                createdAt: (item.createdAt ?? new Date()).toISOString(),
            })),
        };
    }
}

function resolveChartRange(payload?: GetAdminDashboardStatsParams): { from: Date; to: Date } {
    const parsedFrom = parseDateOnly(payload?.from);
    const parsedTo = parseDateOnly(payload?.to);

    if (parsedFrom || parsedTo) {
        const to = parsedTo ?? new Date();
        const from = parsedFrom ?? addDaysUtc(startOfDayUtc(to), -6);
        return {
            from: startOfDayUtc(from),
            to: startOfDayUtc(to),
        };
    }

    const days = payload?.days === 30 ? 30 : 7;
    const to = startOfDayUtc(new Date());
    const from = addDaysUtc(to, -(days - 1));
    return { from, to };
}

function parseDateOnly(value?: string): Date | undefined {
    if (!value?.trim()) return undefined;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return undefined;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (Number.isNaN(date.getTime())) return undefined;
    return date;
}

function startOfDayUtc(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDaysUtc(date: Date, days: number): Date {
    const next = new Date(date.getTime());
    next.setUTCDate(next.getUTCDate() + days);
    return next;
}
