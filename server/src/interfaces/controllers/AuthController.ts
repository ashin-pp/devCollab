import { Request, Response, NextFunction } from "express";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUserUseCase";
import { SendOtpUseCase } from "../../application/use-cases/auth/SendOtpUseCase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { VerifyOtpUseCase } from "../../application/use-cases/auth/VerifyOtpUseCase";

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private sendOtpUseCase: SendOtpUseCase,
    private verifyOtpUseCase: VerifyOtpUseCase,
  ) { }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newUser = await this.registerUserUseCase.execute(req.body);
      const response = ApiResponse.success("User registered successfully", newUser);
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await this.sendOtpUseCase.execute(email);
      const response = ApiResponse.success("OTP sent successfully to email");
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
  public verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.verifyOtpUseCase.execute(req.body);
      const response = ApiResponse.success("Email verified successfully!");
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}