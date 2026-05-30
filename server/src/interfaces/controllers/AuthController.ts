import { Request, Response, NextFunction } from "express";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUserUseCase";
import { SendOtpUseCase } from "../../application/use-cases/auth/SendOtpUseCase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { VerifyOtpUseCase } from "../../application/use-cases/auth/VerifyOtpUseCase";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private sendOtpUseCase: SendOtpUseCase,
    private verifyOtpUseCase: VerifyOtpUseCase,
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
}