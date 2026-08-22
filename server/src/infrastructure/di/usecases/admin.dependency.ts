import { container } from 'tsyringe';
import { USECASE_TOKENS } from "../usecase.tokens";
import { AdminForgotPasswordUseCase } from "../../../application/use-cases/admin/admin-forgot-password.usecase";
import { AdminLoginUseCase } from "../../../application/use-cases/admin/admin-login.usecase";
import { AdminRefreshTokenUseCase } from "../../../application/use-cases/admin/admin-refresh-token.usecase";
import { AdminResetPasswordUseCase } from "../../../application/use-cases/admin/admin-reset-password.usecase";
import { CreateAdminUseCase } from "../../../application/use-cases/admin/create-admin.usecase";
import { GetAllUsersUseCase } from "../../../application/use-cases/admin/get-all-users.usecase";
import { GetAllWorkspacesUseCase } from "../../../application/use-cases/admin/get-all-workspaces.usecase";
import { AdminGetWorkspaceMembersUseCase } from "../../../application/use-cases/admin/get-workspace-members.usecase";
import { ToggleUserStatusUseCase } from "../../../application/use-cases/admin/toggle-user-status.usecase";
import { ToggleWorkspaceStatusUseCase } from "../../../application/use-cases/admin/toggle-workspace-status.usecase";
import { UpdateWorkspaceMemberStatusUseCase } from "../../../application/use-cases/admin/update-workspace-member-status.usecase";
import { GetAdminDashboardStatsUseCase } from "../../../application/use-cases/admin/get-admin-dashboard-stats.usecase";
import { GetAdminSalesReportUseCase } from "../../../application/use-cases/admin/get-admin-sales-report.usecase";
import { DownloadAdminSalesReportPdfUseCase } from "../../../application/use-cases/admin/download-admin-sales-report-pdf.usecase";
import { GetAdminWalletUseCase } from "../../../application/use-cases/admin/get-admin-wallet.usecase";

export function registerAdminUseCases() {
    container.register(USECASE_TOKENS.IAdminForgotPasswordUseCase, { useClass: AdminForgotPasswordUseCase });
    container.register(USECASE_TOKENS.IAdminLoginUseCase, { useClass: AdminLoginUseCase });
    container.register(USECASE_TOKENS.IAdminRefreshTokenUseCase, { useClass: AdminRefreshTokenUseCase });
    container.register(USECASE_TOKENS.IAdminResetPasswordUseCase, { useClass: AdminResetPasswordUseCase });
    container.register(USECASE_TOKENS.ICreateAdminUseCase, { useClass: CreateAdminUseCase });
    container.register(USECASE_TOKENS.IGetAllUsersUseCase, { useClass: GetAllUsersUseCase });
    container.register(USECASE_TOKENS.IGetAllWorkspacesUseCase, { useClass: GetAllWorkspacesUseCase });
    container.register(USECASE_TOKENS.IToggleUserStatusUseCase, { useClass: ToggleUserStatusUseCase });
    container.register(USECASE_TOKENS.IToggleWorkspaceStatusUseCase, { useClass: ToggleWorkspaceStatusUseCase });
    container.register(USECASE_TOKENS.IUpdateWorkspaceMemberStatusUseCase, { useClass: UpdateWorkspaceMemberStatusUseCase });
    container.register(USECASE_TOKENS.IAdminGetWorkspaceMembersUseCase, { useClass: AdminGetWorkspaceMembersUseCase });
    container.register(USECASE_TOKENS.IGetAdminDashboardStatsUseCase, { useClass: GetAdminDashboardStatsUseCase });
    container.register(USECASE_TOKENS.IGetAdminSalesReportUseCase, { useClass: GetAdminSalesReportUseCase });
    container.register(USECASE_TOKENS.IDownloadAdminSalesReportPdfUseCase, { useClass: DownloadAdminSalesReportPdfUseCase });
    container.register(USECASE_TOKENS.IGetAdminWalletUseCase, { useClass: GetAdminWalletUseCase });
}
