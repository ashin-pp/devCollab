import { AdminDashboardStatsResponseDto } from "../../../dtos/admin/response/admin-dashboard-stats.response.dto";

export interface GetAdminDashboardStatsParams {
    days?: number;
    from?: string;
    to?: string;
}

export interface IGetAdminDashboardStatsUseCase {
    execute(payload?: GetAdminDashboardStatsParams): Promise<AdminDashboardStatsResponseDto>;
}
