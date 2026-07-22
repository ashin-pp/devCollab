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
import type { IVerifyResetOtpUseCase } from "../../application/interfaces/use-cases/auth/verify-reset-otp.usecase.interface";
import { envConfig } from "../../config/envConfig";
import { AppConstants } from "../../domain/constants";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { catchAsync } from "../utils/catch-async";

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
        @inject(USECASE_TOKENS.IUpdateWorkspaceMemberStatusUseCase) private _adminUpdateWorkspaceMemberStatusUseCase: IUpdateWorkspaceMemberStatusUseCase
    ) { }

  public createAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await this._createAdminUseCase.execute(req.body);
        const response = ApiResponse.success("Admin created successfully");
        res.status(HttpStatusCode.CREATED).json(response);
        })

  public login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { admin, accessToken, refreshToken } = await this._adminLoginUseCase.execute(req.body);
        res.cookie('adminRefreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: envConfig.refreshCookieMaxAge
              });
        const response = ApiResponse.success(SuccessMessage.LOGIN_SUCCESS, { 
                admin: {
                  id: admin.id,
                  email: admin.email,
                  role: 'admin'
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
        const response = ApiResponse.success("OTP verified successfully");
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
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
              })
        const response = ApiResponse.success(SuccessMessage.LOGOUT_SUCCESS);
        res.status(HttpStatusCode.OK).json(response);
        })

  public refresh = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies?.adminRefreshToken;
        const { admin, accessToken } = await this._adminRefreshTokenUseCase.execute(refreshToken);
        const response = ApiResponse.success(SuccessMessage.LOGIN_SUCCESS, { 
                admin: {
                  id: admin.id,
                  email: admin.email,
                  role: 'admin'
                }, 
                accessToken 
              });
        res.status(HttpStatusCode.OK).json(response);
        })

  public getUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || AppConstants.DEFAULT_PAGE_LIMIT;
        const search = req.query.search as string;
        const filter = req.query.filter as string;
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc';

        const users = await this._getAllUsersUseCase.execute({ page, limit, search, filter, sortBy, sortOrder });
        const response = ApiResponse.success("Users fetched successfully", users);
        res.status(HttpStatusCode.OK).json(response);
        })

  public toggleUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id as string;
        const newStatus = await this._toggleUserStatusUseCase.execute({userId: id});
        const response = ApiResponse.success(`User status changed to ${newStatus}`);
        res.status(HttpStatusCode.OK).json(response);
        })

  public getWorkspaces = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || AppConstants.DEFAULT_PAGE_LIMIT;
        const search = req.query.search as string;
        const filter = req.query.filter as string;
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc';

        const workspaces = await this._getAllWorkspacesUseCase.execute({ params: { page, limit, search, filter, sortBy, sortOrder } });
        const response = ApiResponse.success("Workspaces fetched successfully", workspaces);
        res.status(HttpStatusCode.OK).json(response);
        })

  public toggleWorkspaceStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id as string;
        const { isActive } = req.body;
        await this._adminToggleWorkspaceStatusUseCase.execute({ workspaceId: id, isActive });
        const response = ApiResponse.success(`Workspace status changed to ${isActive ? 'active' : 'deactivated'}`);
        res.status(HttpStatusCode.OK).json(response);
        })

  public getWorkspaceMembers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const workspaceId = req.params.id as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || AppConstants.DEFAULT_PAGE_LIMIT;
        const search = req.query.search as string;
        const filter = req.query.filter as string;
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc';

        const members = await this._adminGetWorkspaceMembersUseCase.execute({ workspaceId, params: { page, limit, search, filter, sortBy, sortOrder } });
        const response = ApiResponse.success("Workspace members fetched successfully", members);
        res.status(HttpStatusCode.OK).json(response);
        })

  public updateWorkspaceMemberStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { workspaceId, userId } = req.params;
        const { status } = req.body;
        await this._adminUpdateWorkspaceMemberStatusUseCase.execute({ workspaceId: workspaceId as string, userId: userId as string, status });
        const response = ApiResponse.success(`Member status updated to ${status}`);
        res.status(HttpStatusCode.OK).json(response);
        })
}
