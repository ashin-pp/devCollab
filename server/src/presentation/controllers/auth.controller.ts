import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from "express";
import { envConfig } from "../../config/envConfig";
import { RegisterUserUseCase } from "../../application/use-cases/auth/register-user.usecase";
import { SendOtpUseCase } from "../../application/use-cases/auth/send-otp.usecase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { VerifyOtpUseCase } from "../../application/use-cases/auth/verify-otp.usecase";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { LoginUserUseCase } from "../../application/use-cases/auth/login-user.usecase";
import { GoogleAuthUseCase } from "../../application/use-cases/auth/google-auth.usecase";
import { ForgotPasswordUseCase } from "../../application/use-cases/auth/forgot-password.usecase";
import { ResetPasswordUseCase } from "../../application/use-cases/auth/reset-password.usecase";
import { RefreshTokenUseCase } from "../../application/use-cases/auth/refresh-token.usecase";
import { VerifyResetOtpUseCase } from "../../application/use-cases/auth/verify-reset-otp.usecase";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class AuthController {
    constructor(
        @inject(RegisterUserUseCase) private readonly _registerUserUseCase: RegisterUserUseCase,
        @inject(SendOtpUseCase) private readonly _sendOtpUseCase: SendOtpUseCase,
        @inject(VerifyOtpUseCase) private readonly _verifyOtpUseCase: VerifyOtpUseCase,
        @inject(LoginUserUseCase) private readonly _loginUserUseCase: LoginUserUseCase,
        @inject(GoogleAuthUseCase) private readonly _googleAuthUseCase: GoogleAuthUseCase,
        @inject(ForgotPasswordUseCase) private readonly _forgotPasswordUseCase: ForgotPasswordUseCase,
        @inject(ResetPasswordUseCase) private readonly _resetPasswordUseCase: ResetPasswordUseCase,
        @inject(RefreshTokenUseCase) private readonly _refreshTokenUseCase: RefreshTokenUseCase,
        @inject(VerifyResetOtpUseCase) private readonly _verifyResetOtpUseCase: VerifyResetOtpUseCase
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