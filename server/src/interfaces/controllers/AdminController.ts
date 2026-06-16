import { Request, Response, NextFunction } from "express";
import { CreateAdminUseCase } from "../../application/use-cases/admin/CreateAdminUseCase";
import { AdminLoginUseCase } from "../../application/use-cases/admin/AdminLoginUseCase";
import { AdminForgotPasswordUseCase } from "../../application/use-cases/admin/AdminForgotPasswordUseCase";
import { AdminResetPasswordUseCase } from "../../application/use-cases/admin/AdminResetPasswordUseCase";
import { GetAllUsersUseCase } from "../../application/use-cases/admin/GetAllUsersUseCase";
import { ToggleUserStatusUseCase } from "../../application/use-cases/admin/ToggleUserStatusUseCase";
import { VerifyResetOtpUseCase } from "../../application/use-cases/auth/VerifyResetOtpUseCase";
import { AdminRefreshTokenUseCase } from "../../application/use-cases/admin/AdminRefreshTokenUseCase";
import { GetAllWorkspacesUseCase } from "../../application/use-cases/workspace/GetAllWorkspacesUseCase";
import { AdminToggleWorkspaceStatusUseCase } from "../../application/use-cases/workspace/AdminToggleWorkspaceStatusUseCase";
import { AdminGetWorkspaceMembersUseCase } from "../../application/use-cases/workspace/AdminGetWorkspaceMembersUseCase";
import { AdminUpdateWorkspaceMemberStatusUseCase } from "../../application/use-cases/workspace/AdminUpdateWorkspaceMemberStatusUseCase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";

export class AdminController {
  constructor(
    private createAdminUseCase: CreateAdminUseCase,
    private adminLoginUseCase: AdminLoginUseCase,
    private adminForgotPasswordUseCase: AdminForgotPasswordUseCase,
    private adminResetPasswordUseCase: AdminResetPasswordUseCase,
    private getAllUsersUseCase: GetAllUsersUseCase,
    private toggleUserStatusUseCase: ToggleUserStatusUseCase,
    private verifyResetOtpUseCase: VerifyResetOtpUseCase,
    private adminRefreshTokenUseCase: AdminRefreshTokenUseCase,
    private getAllWorkspacesUseCase: GetAllWorkspacesUseCase,
    private adminToggleWorkspaceStatusUseCase: AdminToggleWorkspaceStatusUseCase,
    private adminGetWorkspaceMembersUseCase: AdminGetWorkspaceMembersUseCase,
    private adminUpdateWorkspaceMemberStatusUseCase: AdminUpdateWorkspaceMemberStatusUseCase
  ) { }

  public createAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.createAdminUseCase.execute(req.body);
      const response = ApiResponse.success("Admin created successfully");
      res.status(HttpStatusCode.CREATED).json(response);
    } catch (err) {
      next(err);
    }
  }

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { admin, accessToken, refreshToken } = await this.adminLoginUseCase.execute(req.body);
      
      res.cookie('adminRefreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
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
    } catch (err) {
      next(err);
    }
  }

  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.adminForgotPasswordUseCase.execute(req.body.email);
      const response = ApiResponse.success(SuccessMessage.OTP_SENT_FOR_RESET);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public verifyResetOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.verifyResetOtpUseCase.execute(req.body.email, req.body.otp);
      const response = ApiResponse.success("OTP verified successfully");
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.adminResetPasswordUseCase.execute(req.body);
      const response = ApiResponse.success(SuccessMessage.PASSWORD_RESET_SUCCESS);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie('adminRefreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      
      const response = ApiResponse.success(SuccessMessage.LOGOUT_SUCCESS);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.adminRefreshToken;
      const { admin, accessToken } = await this.adminRefreshTokenUseCase.execute(refreshToken);
      
      const response = ApiResponse.success(SuccessMessage.LOGIN_SUCCESS, { 
        admin: {
          id: admin.id,
          email: admin.email,
          role: 'admin'
        }, 
        accessToken 
      });
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.getAllUsersUseCase.execute();
      const response = ApiResponse.success("Users fetched successfully", users);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public toggleUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const newStatus = await this.toggleUserStatusUseCase.execute(id);
      const response = ApiResponse.success(`User status changed to ${newStatus}`);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getWorkspaces = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaces = await this.getAllWorkspacesUseCase.execute();
      const response = ApiResponse.success("Workspaces fetched successfully", workspaces);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public toggleWorkspaceStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { isActive } = req.body;
      await this.adminToggleWorkspaceStatusUseCase.execute(id, isActive);
      const response = ApiResponse.success(`Workspace status changed to ${isActive ? 'active' : 'deactivated'}`);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getWorkspaceMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.params.id as string;
      const members = await this.adminGetWorkspaceMembersUseCase.execute(workspaceId);
      const response = ApiResponse.success("Workspace members fetched successfully", members);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public updateWorkspaceMemberStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { workspaceId, userId } = req.params;
      const { status } = req.body;
      await this.adminUpdateWorkspaceMemberStatusUseCase.execute(workspaceId as string, userId as string, status);
      const response = ApiResponse.success(`Member status updated to ${status}`);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }
}
