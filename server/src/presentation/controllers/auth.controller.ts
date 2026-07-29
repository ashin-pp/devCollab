import { NextFunction, Request, Response } from "express";
import { inject, injectable } from 'tsyringe';
import type { IForgotPasswordUseCase } from "../../application/interfaces/use-cases/auth/forgot-password.usecase.interface";
import type { IGoogleAuthUseCase } from "../../application/interfaces/use-cases/auth/google-auth.usecase.interface";
import type { ILoginUserUseCase } from "../../application/interfaces/use-cases/auth/login-user.usecase.interface";
import type { IRefreshTokenUseCase } from "../../application/interfaces/use-cases/auth/refresh-token.usecase.interface";
import type { IRegisterUserUseCase } from "../../application/interfaces/use-cases/auth/register-user.usecase.interface";
import type { IResetPasswordUseCase } from "../../application/interfaces/use-cases/auth/reset-password.usecase.interface";
import type { ISendOtpUseCase } from "../../application/interfaces/use-cases/auth/send-otp.usecase.interface";
import type { IVerifyOtpUseCase } from "../../application/interfaces/use-cases/auth/verify-otp.usecase.interface";
import type { IVerifyResetOtpUseCase } from "../../application/interfaces/use-cases/auth/verify-reset-otp.usecase.interface";
import { envConfig } from "../../config/envConfig";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class AuthController {
    constructor(
        @inject(USECASE_TOKENS.IRegisterUserUseCase) private readonly _registerUserUseCase: IRegisterUserUseCase,
        @inject(USECASE_TOKENS.ISendOtpUseCase) private readonly _sendOtpUseCase: ISendOtpUseCase,
        @inject(USECASE_TOKENS.IVerifyOtpUseCase) private readonly _verifyOtpUseCase: IVerifyOtpUseCase,
        @inject(USECASE_TOKENS.ILoginUserUseCase) private readonly _loginUserUseCase: ILoginUserUseCase,
        @inject(USECASE_TOKENS.IGoogleAuthUseCase) private readonly _googleAuthUseCase: IGoogleAuthUseCase,
        @inject(USECASE_TOKENS.IForgotPasswordUseCase) private readonly _forgotPasswordUseCase: IForgotPasswordUseCase,
        @inject(USECASE_TOKENS.IResetPasswordUseCase) private readonly _resetPasswordUseCase: IResetPasswordUseCase,
        @inject(USECASE_TOKENS.IRefreshTokenUseCase) private readonly _refreshTokenUseCase: IRefreshTokenUseCase,
        @inject(USECASE_TOKENS.IVerifyResetOtpUseCase) private readonly _verifyResetOtpUseCase: IVerifyResetOtpUseCase
    ) { }

  public register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const newUser = await this._registerUserUseCase.execute(req.body);
        const response = ApiResponse.success(SuccessMessage.USER_REGISTERED, newUser);
        res.status(HttpStatusCode.CREATED).json(response);
        })

  public sendOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        await this._sendOtpUseCase.execute({email});
        const response = ApiResponse.success(SuccessMessage.OTP_SENT);
        res.status(HttpStatusCode.OK).json(response);
        })
  public verifyOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await this._verifyOtpUseCase.execute(req.body);
        const response = ApiResponse.success(SuccessMessage.EMAIL_VERIFIED);
        res.status(HttpStatusCode.OK).json(response);
        })
  public login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { user, accessToken, refreshToken } = await this._loginUserUseCase.execute(req.body);
        res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: envConfig.refreshCookieMaxAge
              });
        const response = ApiResponse.success(SuccessMessage.LOGIN_SUCCESS, { user, accessToken });
        res.status(HttpStatusCode.OK).json(response);
        })
  public logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        res.clearCookie('refreshToken',{
                httpOnly:true,
                secure:process.env.NODE_ENV=="production",
                sameSite:"strict",
              })
        const response=ApiResponse.success(SuccessMessage.LOGOUT_SUCCESS);
        res.status(HttpStatusCode.OK).json(response);
        })

  public googleAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { user, accessToken, refreshToken } = await this._googleAuthUseCase.execute(req.body);
        res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: envConfig.refreshCookieMaxAge
              });
        const response = ApiResponse.success(SuccessMessage.LOGIN_SUCCESS, { user, accessToken });
        res.status(HttpStatusCode.OK).json(response);
        })
  public forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await this._forgotPasswordUseCase.execute({email: req.body.email});
        const response = ApiResponse.success(SuccessMessage.OTP_SENT_FOR_RESET);
        res.status(HttpStatusCode.OK).json(response);
        })

  public verifyResetOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await this._verifyResetOtpUseCase.execute({ email: req.body.email, otp: req.body.otp });
        const response = ApiResponse.success("OTP verified");
        res.status(HttpStatusCode.OK).json(response);
        })

  public resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await this._resetPasswordUseCase.execute(req.body);
        const response = ApiResponse.success(SuccessMessage.PASSWORD_RESET_SUCCESS);
        res.status(HttpStatusCode.OK).json(response);
        })

  public refresh = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies?.refreshToken;
        const { user, accessToken } = await this._refreshTokenUseCase.execute({refreshToken});
        const response = ApiResponse.success("Token refreshed successfully", { user, accessToken });
        res.status(HttpStatusCode.OK).json(response);
        })
}