import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
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
        @inject(USECASE_TOKENS.IRegisterUserUseCase)
        private readonly _registerUserUseCase: IRegisterUserUseCase,
        @inject(USECASE_TOKENS.ISendOtpUseCase)
        private readonly _sendOtpUseCase: ISendOtpUseCase,
        @inject(USECASE_TOKENS.IVerifyOtpUseCase)
        private readonly _verifyOtpUseCase: IVerifyOtpUseCase,
        @inject(USECASE_TOKENS.ILoginUserUseCase)
        private readonly _loginUserUseCase: ILoginUserUseCase,
        @inject(USECASE_TOKENS.IGoogleAuthUseCase)
        private readonly _googleAuthUseCase: IGoogleAuthUseCase,
        @inject(USECASE_TOKENS.IForgotPasswordUseCase)
        private readonly _forgotPasswordUseCase: IForgotPasswordUseCase,
        @inject(USECASE_TOKENS.IResetPasswordUseCase)
        private readonly _resetPasswordUseCase: IResetPasswordUseCase,
        @inject(USECASE_TOKENS.IRefreshTokenUseCase)
        private readonly _refreshTokenUseCase: IRefreshTokenUseCase,
        @inject(USECASE_TOKENS.IVerifyResetOtpUseCase)
        private readonly _verifyResetOtpUseCase: IVerifyResetOtpUseCase
    ) {}

    register = catchAsync(async (req: Request, res: Response) => {
        const newUser = await this._registerUserUseCase.execute(req.body);
        res.status(HttpStatusCode.CREATED).json(
            ApiResponse.success(SuccessMessage.USER_REGISTERED, newUser)
        );
    });

    sendOtp = catchAsync(async (req: Request, res: Response) => {
        const { email } = req.body;
        await this._sendOtpUseCase.execute({ email });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.OTP_SENT)
        );
    });

    verifyOtp = catchAsync(async (req: Request, res: Response) => {
        await this._verifyOtpUseCase.execute(req.body);
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.EMAIL_VERIFIED)
        );
    });

    login = catchAsync(async (req: Request, res: Response) => {
        const { user, accessToken, refreshToken } = await this._loginUserUseCase.execute(req.body);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: envConfig.refreshCookieMaxAge,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.LOGIN_SUCCESS, { user, accessToken })
        );
    });

    logout = catchAsync(async (_req: Request, res: Response) => {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.LOGOUT_SUCCESS)
        );
    });

    googleAuth = catchAsync(async (req: Request, res: Response) => {
        const { user, accessToken, refreshToken, isNewUser } =
            await this._googleAuthUseCase.execute(req.body);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: envConfig.refreshCookieMaxAge,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.LOGIN_SUCCESS, { user, accessToken, isNewUser })
        );
    });

    forgotPassword = catchAsync(async (req: Request, res: Response) => {
        await this._forgotPasswordUseCase.execute({ email: req.body.email });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.OTP_SENT_FOR_RESET)
        );
    });

    verifyResetOtp = catchAsync(async (req: Request, res: Response) => {
        await this._verifyResetOtpUseCase.execute({
            email: req.body.email,
            otp: req.body.otp,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.OTP_VERIFIED)
        );
    });

    resetPassword = catchAsync(async (req: Request, res: Response) => {
        await this._resetPasswordUseCase.execute(req.body);
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.PASSWORD_RESET_SUCCESS)
        );
    });

    refresh = catchAsync(async (req: Request, res: Response) => {
        const refreshToken = req.cookies?.refreshToken;
        const { user, accessToken } = await this._refreshTokenUseCase.execute({ refreshToken });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.TOKEN_REFRESHED, { user, accessToken })
        );
    });
}
