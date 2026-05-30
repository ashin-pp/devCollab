import { WinstonLogger } from "../infra/services/WinstonLogger";
import { UserModel } from "../infra/database/models/UserModel";
import { UserRepository } from "../infra/repositories/UserRepository";
import { BcryptHashService } from "../infra/services/BcryptHashService";
import { RegisterUserUseCase } from "../application/use-cases/auth/RegisterUserUseCase";
import { AuthController } from "../interfaces/controllers/AuthController";
import { OtpModel } from "../infra/database/models/OtpModel";
import { OtpRepository } from "../infra/repositories/OtpRepository";
import { ConsoleEmailService } from "../infra/services/ConsoleEmailService";
import { SendOtpUseCase } from "../application/use-cases/auth/SendOtpUseCase";
import { VerifyOtpUseCase } from "../application/use-cases/auth/VerifyOtpUseCase";
const logger = new WinstonLogger();
const hashService = new BcryptHashService();
const emailService = new ConsoleEmailService();

const userRepository = new UserRepository(UserModel);
const otpRepository = new OtpRepository(OtpModel);

const registerUserUseCase = new RegisterUserUseCase(userRepository, hashService);
const sendOtpUseCase = new SendOtpUseCase(otpRepository, emailService);
const verifyOtpUseCase = new VerifyOtpUseCase(otpRepository, userRepository);

const authController = new AuthController(registerUserUseCase, sendOtpUseCase, verifyOtpUseCase);

export { logger, authController };
