import { NextFunction, Request, Response } from "express";
import { inject, injectable } from 'tsyringe';
import type { IAdminForgotPasswordUseCase } from "../../application/interfaces/use-cases/admin/admin-forgot-password.usecase.interface";
import type { IAdminLoginUseCase } from "../../application/interfaces/use-cases/admin/admin-login.usecase.interface";
import type { IAdminRefreshTokenUseCase } from "../../application/interfaces/use-cases/admin/admin-refresh-token.usecase.interface";
import type { IAdminResetPasswordUseCase } from "../../application/interfaces/use-cases/admin/admin-reset-password.usecase.interface";
import type { ICreateAdminUseCase } from "../../application/interfaces/use-cases/admin/create-admin.usecase.interface";
import type { IGetAllUsersUseCase } from "../../application/interfaces/use-cases/admin/get-all-users.usecase.interface";
import type { IGetAllWorkspacesUseCase } from "../../application/interfaces/use-cases/admin/get-all-workspaces.usecase.interface";
import type { IAdminGetWorkspaceMembersUseCase } from "../../application/interfaces/use-cases/admin/admin-get-workspace-members.usecase.interface";
import type { IToggleUserStatusUseCase } from "../../application/interfaces/use-cases/admin/toggle-user-status.usecase.interface";
import type { IToggleWorkspaceStatusUseCase } from "../../application/interfaces/use-cases/admin/toggle-workspace-status.usecase.interface";
import type { IUpdateWorkspaceMemberStatusUseCase } from "../../application/interfaces/use-cases/admin/update-workspace-member-status.usecase.interface";
import type { IGetAdminDashboardStatsUseCase } from "../../application/interfaces/use-cases/admin/get-admin-dashboard-stats.usecase.interface";
import type { IGetAdminSalesReportUseCase } from "../../application/interfaces/use-cases/admin/get-admin-sales-report.usecase.interface";
import type { IDownloadAdminSalesReportPdfUseCase } from "../../application/interfaces/use-cases/admin/download-admin-sales-report-pdf.usecase.interface";
import type { IGetAdminWalletUseCase } from "../../application/interfaces/use-cases/admin/get-admin-wallet.usecase.interface";
import type { IVerifyResetOtpUseCase } from "../../application/interfaces/use-cases/auth/verify-reset-otp.usecase.interface";
import type { PaymentTransactionStatus } from "../../domain/types/payment-transaction-status";
import { envConfig } from "../../config/envConfig";
import { AppConstants } from "../../domain/constants";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { Role } from "../../domain/enums/Role";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { catchAsync } from "../utils/catch-async";
import type {
    adminDashboardQuerySchema,
    adminSalesQuerySchema,
    adminUsersQuerySchema,
    adminWalletQuerySchema,
    adminWorkspaceMembersQuerySchema,
    adminWorkspacesQuerySchema,
} from "../validators/admin.schema";
import type { z } from "zod";

@injectable()
export class AdminController {
  constructor(
        @inject(USECASE_TOKENS.ICreateAdminUseCase) private _createAdminUseCase: ICreateAdminUseCase,
        @inject(USECASE_TOKENS.IAdminLoginUseCase) private _adminLoginUseCase: IAdminLoginUseCase,
        @inject(USECASE_TOKENS.IAdminForgotPasswordUseCase) private _adminForgotPasswordUseCase: IAdminForgotPasswordUseCase,
        @inject(USECASE_TOKENS.IAdminResetPasswordUseCase) private _adminResetPasswordUseCase: IAdminResetPasswordUseCase,
        @inject(USECASE_TOKENS.IGetAllUsersUseCase) private _getAllUsersUseCase: IGetAllUsersUseCase,
        @inject(USECASE_TOKENS.IToggleUserStatusUseCase) private _toggleUserStatusUseCase: IToggleUserStatusUseCase,
        @inject(USECASE_TOKENS.IVerifyResetOtpUseCase) private _verifyResetOtpUseCase: IVerifyResetOtpUseCase,
        @inject(USECASE_TOKENS.IAdminRefreshTokenUseCase) private _adminRefreshTokenUseCase: IAdminRefreshTokenUseCase,
        @inject(USECASE_TOKENS.IGetAllWorkspacesUseCase) private _getAllWorkspacesUseCase: IGetAllWorkspacesUseCase,
        @inject(USECASE_TOKENS.IToggleWorkspaceStatusUseCase) private _adminToggleWorkspaceStatusUseCase: IToggleWorkspaceStatusUseCase,
        @inject(USECASE_TOKENS.IAdminGetWorkspaceMembersUseCase) private _adminGetWorkspaceMembersUseCase: IAdminGetWorkspaceMembersUseCase,
        @inject(USECASE_TOKENS.IUpdateWorkspaceMemberStatusUseCase) private _adminUpdateWorkspaceMemberStatusUseCase: IUpdateWorkspaceMemberStatusUseCase,
        @inject(USECASE_TOKENS.IGetAdminDashboardStatsUseCase) private _getAdminDashboardStatsUseCase: IGetAdminDashboardStatsUseCase,
        @inject(USECASE_TOKENS.IGetAdminSalesReportUseCase) private _getAdminSalesReportUseCase: IGetAdminSalesReportUseCase,
        @inject(USECASE_TOKENS.IDownloadAdminSalesReportPdfUseCase) private _downloadAdminSalesReportPdfUseCase: IDownloadAdminSalesReportPdfUseCase,
        @inject(USECASE_TOKENS.IGetAdminWalletUseCase) private _getAdminWalletUseCase: IGetAdminWalletUseCase
    ) { }

  public createAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await this._createAdminUseCase.execute(req.body);
        const response = ApiResponse.success(SuccessMessage.ADMIN_CREATED);
        res.status(HttpStatusCode.CREATED).json(response);
        })

  public login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { admin, accessToken, refreshToken } = await this._adminLoginUseCase.execute(req.body);
        res.cookie('adminRefreshToken', refreshToken, {
                httpOnly: true,
                secure: envConfig.cookieSecure,
                sameSite: envConfig.cookieSameSite,
                maxAge: envConfig.refreshCookieMaxAge
              });
        const response = ApiResponse.success(SuccessMessage.LOGIN_SUCCESS, { 
                admin: {
                  id: admin.id,
                  email: admin.email,
                  role: Role.ADMIN
                }, 
                accessToken 
              });
        res.status(HttpStatusCode.OK).json(response);
        })

  public forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await this._adminForgotPasswordUseCase.execute(req.body.email);
        const response = ApiResponse.success(SuccessMessage.OTP_SENT_FOR_RESET);
        res.status(HttpStatusCode.OK).json(response);
        })

  public verifyResetOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await this._verifyResetOtpUseCase.execute({ email: req.body.email, otp: req.body.otp });
        const response = ApiResponse.success(SuccessMessage.OTP_VERIFIED);
        res.status(HttpStatusCode.OK).json(response);
        })

  public resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await this._adminResetPasswordUseCase.execute(req.body);
        const response = ApiResponse.success(SuccessMessage.PASSWORD_RESET_SUCCESS);
        res.status(HttpStatusCode.OK).json(response);
        })

  public logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        res.clearCookie('adminRefreshToken', {
                httpOnly: true,
                secure: envConfig.cookieSecure,
                sameSite: envConfig.cookieSameSite,
              })
        const response = ApiResponse.success(SuccessMessage.LOGOUT_SUCCESS);
        res.status(HttpStatusCode.OK).json(response);
        })

  public refresh = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies?.adminRefreshToken;
        const { admin, accessToken } = await this._adminRefreshTokenUseCase.execute({ refreshToken });
        const response = ApiResponse.success(SuccessMessage.TOKEN_REFRESHED, { 
                admin: {
                  id: admin.id,
                  email: admin.email,
                  role: Role.ADMIN
                }, 
                accessToken 
              });
        res.status(HttpStatusCode.OK).json(response);
        })

  public getUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query as unknown as z.infer<typeof adminUsersQuerySchema>;
        const page = query.page ?? 1;
        const limit = query.limit ?? AppConstants.DEFAULT_PAGE_LIMIT;
        const search = query.search;
        const filter = query.filter;
        const planId = query.planId;
        const sortBy = query.sortBy;
        const sortOrder = query.sortOrder;

        const users = await this._getAllUsersUseCase.execute({ page, limit, search, filter, planId, sortBy, sortOrder });
        const response = ApiResponse.success(SuccessMessage.USERS_FETCHED, users);
        res.status(HttpStatusCode.OK).json(response);
        })

  public toggleUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id as string;
        const newStatus = await this._toggleUserStatusUseCase.execute({userId: id});
        const response = ApiResponse.success(SuccessMessage.USER_STATUS_UPDATED, { status: newStatus });
        res.status(HttpStatusCode.OK).json(response);
        })

  public getWorkspaces = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query as unknown as z.infer<typeof adminWorkspacesQuerySchema>;
        const page = query.page ?? 1;
        const limit = query.limit ?? AppConstants.DEFAULT_PAGE_LIMIT;
        const search = query.search;
        const filter = query.filter;
        const planId = query.planId;
        const sortBy = query.sortBy;
        const sortOrder = query.sortOrder;

        const workspaces = await this._getAllWorkspacesUseCase.execute({ params: { page, limit, search, filter, planId, sortBy, sortOrder } });
        const response = ApiResponse.success(SuccessMessage.WORKSPACES_FETCHED, workspaces);
        res.status(HttpStatusCode.OK).json(response);
        })

  public toggleWorkspaceStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id as string;
        const { isActive } = req.body;
        await this._adminToggleWorkspaceStatusUseCase.execute({ workspaceId: id, isActive });
        const response = ApiResponse.success(SuccessMessage.WORKSPACE_STATUS_UPDATED);
        res.status(HttpStatusCode.OK).json(response);
        })

  public getWorkspaceMembers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const workspaceId = req.params.id as string;
        const query = req.query as unknown as z.infer<typeof adminWorkspaceMembersQuerySchema>;
        const page = query.page ?? 1;
        const limit = query.limit ?? AppConstants.DEFAULT_PAGE_LIMIT;
        const search = query.search;
        const filter = query.filter;
        const sortBy = query.sortBy;
        const sortOrder = query.sortOrder;

        const members = await this._adminGetWorkspaceMembersUseCase.execute({ workspaceId, params: { page, limit, search, filter, sortBy, sortOrder } });
        const response = ApiResponse.success(SuccessMessage.WORKSPACE_MEMBERS_FETCHED, members);
        res.status(HttpStatusCode.OK).json(response);
        })

  public updateWorkspaceMemberStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { workspaceId, userId } = req.params;
        const { status } = req.body;
        await this._adminUpdateWorkspaceMemberStatusUseCase.execute({ workspaceId: workspaceId as string, userId: userId as string, status });
        const response = ApiResponse.success(SuccessMessage.MEMBER_STATUS_UPDATED);
        res.status(HttpStatusCode.OK).json(response);
        })

  public getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query as unknown as z.infer<typeof adminDashboardQuerySchema>;
        const stats = await this._getAdminDashboardStatsUseCase.execute({
            days: query.days,
            from: query.from,
            to: query.to,
        });
        const response = ApiResponse.success(SuccessMessage.ADMIN_DASHBOARD_FETCHED, stats);
        res.status(HttpStatusCode.OK).json(response);
        })

  public getSalesReport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query as unknown as z.infer<typeof adminSalesQuerySchema>;
        const page = query.page ?? 1;
        const limit = query.limit ?? AppConstants.DEFAULT_PAGE_LIMIT;

        const report = await this._getAdminSalesReportUseCase.execute({
            page,
            limit,
            status: query.status as PaymentTransactionStatus | undefined,
            planName: query.planName,
            from: query.from,
            to: query.to,
        });
        const response = ApiResponse.success(SuccessMessage.ADMIN_SALES_REPORT_FETCHED, report);
        res.status(HttpStatusCode.OK).json(response);
        })

  public downloadSalesReportPdf = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query as unknown as z.infer<typeof adminSalesQuerySchema>;
        const { buffer, filename } = await this._downloadAdminSalesReportPdfUseCase.execute({
            status: query.status,
            planName: query.planName,
            from: query.from,
            to: query.to,
        });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.status(HttpStatusCode.OK).send(buffer);
        })

  public getWallet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query as unknown as z.infer<typeof adminWalletQuerySchema>;
        const page = query.page ?? 1;
        const limit = query.limit ?? AppConstants.DEFAULT_PAGE_LIMIT;
        const wallet = await this._getAdminWalletUseCase.execute({ page, limit });
        const response = ApiResponse.success(SuccessMessage.ADMIN_WALLET_FETCHED, wallet);
        res.status(HttpStatusCode.OK).json(response);
        })
}
