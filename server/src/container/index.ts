import { WinstonLogger } from "../infra/services/WinstonLogger";
import { UserModel } from "../infra/database/models/UserModel";
import { UserRepository } from "../infra/repositories/UserRepository";
import { BcryptHashService } from "../infra/services/BcryptHashService";
import { RegisterUserUseCase } from "../application/use-cases/auth/RegisterUserUseCase";
import { AuthController } from "../interfaces/controllers/AuthController";
import { OtpModel } from "../infra/database/models/OtpModel";
import { OtpRepository } from "../infra/repositories/OtpRepository";
import { NodemailerEmailService } from "../infra/services/NodemailerEmailService";
import { SendOtpUseCase } from "../application/use-cases/auth/SendOtpUseCase";
import { VerifyOtpUseCase } from "../application/use-cases/auth/VerifyOtpUseCase";
import { LoginUserUseCase } from "../application/use-cases/auth/LoginUserUseCase";
import { GoogleAuthUseCase } from "../application/use-cases/auth/GoogleAuthUseCase";
import { ForgotPasswordUseCase } from "../application/use-cases/auth/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../application/use-cases/auth/ResetPasswordUseCase";
import { JwtService } from "../infra/services/JwtService";

const logger = new WinstonLogger();
const hashService = new BcryptHashService();
const emailService = new NodemailerEmailService();
const jwtService = new JwtService();

const userRepository = new UserRepository(UserModel);
const otpRepository = new OtpRepository(OtpModel);

const registerUserUseCase = new RegisterUserUseCase(userRepository, hashService);
const sendOtpUseCase = new SendOtpUseCase(otpRepository, emailService);
const verifyOtpUseCase = new VerifyOtpUseCase(otpRepository, userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository, hashService, jwtService);
const googleAuthUseCase = new GoogleAuthUseCase(userRepository, jwtService);
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, sendOtpUseCase);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository, otpRepository, hashService);

const authController = new AuthController(
    registerUserUseCase,
    sendOtpUseCase,
    verifyOtpUseCase,
    loginUserUseCase,
    googleAuthUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase
);

export { logger, authController };
