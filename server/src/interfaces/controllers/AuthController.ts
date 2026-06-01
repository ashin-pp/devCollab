import { Request, Response, NextFunction } from "express";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUserUseCase";
import { SendOtpUseCase } from "../../application/use-cases/auth/SendOtpUseCase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { VerifyOtpUseCase } from "../../application/use-cases/auth/VerifyOtpUseCase";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { LoginUserUseCase } from "../../application/use-cases/auth/LoginUserUseCase";
import { GoogleAuthUseCase } from "../../application/use-cases/auth/GoogleAuthUseCase";
import { ForgotPasswordUseCase } from "../../application/use-cases/auth/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../../application/use-cases/auth/ResetPasswordUseCase";
import { RefreshTokenUseCase } from "../../application/use-cases/auth/RefreshTokenUseCase";
import { VerifyResetOtpUseCase } from "../../application/use-cases/auth/VerifyResetOtpUseCase";

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private sendOtpUseCase: SendOtpUseCase,
    private verifyOtpUseCase: VerifyOtpUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private googleAuthUseCase: GoogleAuthUseCase,
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private verifyResetOtpUseCase: VerifyResetOtpUseCase
  ) { }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newUser = await this.registerUserUseCase.execute(req.body);
      const response = ApiResponse.success(SuccessMessage.USER_REGISTERED, newUser);
      res.status(HttpStatusCode.CREATED).json(response);
    } catch (err) {
      next(err);
    }
  }

  public sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await this.sendOtpUseCase.execute(email);
      const response = ApiResponse.success(SuccessMessage.OTP_SENT);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }
  public verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.verifyOtpUseCase.execute(req.body);
      const response = ApiResponse.success(SuccessMessage.EMAIL_VERIFIED);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await this.loginUserUseCase.execute(req.body);
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7*24*60*60*1000
      });
      const response = ApiResponse.success(SuccessMessage.LOGIN_SUCCESS, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'user'
        },
        accessToken
      });
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }
  public logout=async (req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      res.clearCookie('refreshToken',{
        httpOnly:true,
        secure:process.env.NODE_ENV=="production",
        sameSite:"strict",
      })
      
      const response=ApiResponse.success(SuccessMessage.LOGOUT_SUCCESS);
      res.status(HttpStatusCode.OK).json(response);
    }catch(err){
      next(err)
    }
  }

  public googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await this.googleAuthUseCase.execute(req.body);
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      const response = ApiResponse.success(SuccessMessage.LOGIN_SUCCESS, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          role: 'user'
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
      await this.forgotPasswordUseCase.execute(req.body.email);
      const response = ApiResponse.success(SuccessMessage.OTP_SENT_FOR_RESET);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public verifyResetOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.verifyResetOtpUseCase.execute(req.body.email, req.body.otp);
      const response = ApiResponse.success("OTP verified");
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.resetPasswordUseCase.execute(req.body);
      const response = ApiResponse.success(SuccessMessage.PASSWORD_RESET_SUCCESS);
      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      
      const { user, accessToken } = await this.refreshTokenUseCase.execute(refreshToken);
      
      const response = ApiResponse.success("Token refreshed successfully", {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'user'
        },
        accessToken
      });

      res.status(HttpStatusCode.OK).json(response);
    } catch (err) {
      res.clearCookie('refreshToken');
      next(err);
    }
  }
}