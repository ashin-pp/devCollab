import { Request, Response, NextFunction } from "express";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUserUseCase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";

export class AuthController {
  constructor(private registerUserUseCase: RegisterUserUseCase) { }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newUser = await this.registerUserUseCase.execute(req.body);
      const response = ApiResponse.success("User registered successfully", newUser);
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
}