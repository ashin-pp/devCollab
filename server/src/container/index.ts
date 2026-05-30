import { WinstonLogger } from "../infra/services/WinstonLogger";
import { UserModel } from "../infra/database/models/UserModel";
import { UserRepository } from "../infra/repositories/UserRepository";
import { BcryptHashService } from "../infra/services/BcryptHashService";
import { RegisterUserUseCase } from "../application/use-cases/auth/RegisterUserUseCase";
import { AuthController } from "../interfaces/controllers/AuthController";

// 1. Services
const logger = new WinstonLogger();
const hashService = new BcryptHashService();

// 2. Repositories
const userRepository = new UserRepository(UserModel);

// 3. Use Cases
const registerUserUseCase = new RegisterUserUseCase(userRepository, hashService);

// 4. Controllers
const authController = new AuthController(registerUserUseCase);

export { logger, authController };
