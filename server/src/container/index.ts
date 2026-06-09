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
import { RefreshTokenUseCase } from "../application/use-cases/auth/RefreshTokenUseCase";
import { VerifyResetOtpUseCase } from "../application/use-cases/auth/VerifyResetOtpUseCase";
import { JwtService } from "../infra/services/JwtService";

// Admin Imports
import { AdminModel } from "../infra/database/models/AdminModel";
import { AdminRepository } from "../infra/repositories/AdminRepository";
import { CreateAdminUseCase } from "../application/use-cases/admin/CreateAdminUseCase";
import { AdminLoginUseCase } from "../application/use-cases/admin/AdminLoginUseCase";
import { AdminForgotPasswordUseCase } from "../application/use-cases/admin/AdminForgotPasswordUseCase";
import { AdminResetPasswordUseCase } from "../application/use-cases/admin/AdminResetPasswordUseCase";
import { GetAllUsersUseCase } from "../application/use-cases/admin/GetAllUsersUseCase";
import { ToggleUserStatusUseCase } from "../application/use-cases/admin/ToggleUserStatusUseCase";
import { AdminRefreshTokenUseCase } from "../application/use-cases/admin/AdminRefreshTokenUseCase";
import { AdminController } from "../interfaces/controllers/AdminController";

// User Imports
import { GetUserProfileUseCase } from "../application/use-cases/user/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "../application/use-cases/user/UpdateUserProfileUseCase";
import { ChangePasswordUseCase } from "../application/use-cases/user/ChangePasswordUseCase";
import { UserController } from "../interfaces/controllers/UserController";

const logger = new WinstonLogger();
const hashService = new BcryptHashService();
const emailService = new NodemailerEmailService();
const jwtService = new JwtService();

const userRepository = new UserRepository(UserModel);
const otpRepository = new OtpRepository(OtpModel);
const adminRepository = new AdminRepository(AdminModel);

const registerUserUseCase = new RegisterUserUseCase(userRepository, hashService);
const sendOtpUseCase = new SendOtpUseCase(otpRepository, emailService);
const verifyOtpUseCase = new VerifyOtpUseCase(otpRepository, userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository, hashService, jwtService);
const googleAuthUseCase = new GoogleAuthUseCase(userRepository, jwtService);
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, sendOtpUseCase);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository, otpRepository, hashService);
const refreshTokenUseCase = new RefreshTokenUseCase(jwtService, userRepository);
const verifyResetOtpUseCase = new VerifyResetOtpUseCase(otpRepository);

const authController = new AuthController(
    registerUserUseCase,
    sendOtpUseCase,
    verifyOtpUseCase,
    loginUserUseCase,
    googleAuthUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    refreshTokenUseCase,
    verifyResetOtpUseCase
);

// Admin Use Cases
const createAdminUseCase = new CreateAdminUseCase(adminRepository, hashService);
const adminLoginUseCase = new AdminLoginUseCase(adminRepository, hashService, jwtService);
const adminForgotPasswordUseCase = new AdminForgotPasswordUseCase(adminRepository, sendOtpUseCase, otpRepository);
const adminResetPasswordUseCase = new AdminResetPasswordUseCase(adminRepository, otpRepository, hashService);
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const toggleUserStatusUseCase = new ToggleUserStatusUseCase(userRepository);
const adminRefreshTokenUseCase = new AdminRefreshTokenUseCase(jwtService, adminRepository);

const adminController = new AdminController(
    createAdminUseCase,
    adminLoginUseCase,
    adminForgotPasswordUseCase,
    adminResetPasswordUseCase,
    getAllUsersUseCase,
    toggleUserStatusUseCase,
    verifyResetOtpUseCase,
    adminRefreshTokenUseCase
);

// User Use Cases
const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
const changePasswordUseCase = new ChangePasswordUseCase(userRepository, hashService);

const userController = new UserController(
    getUserProfileUseCase,
    updateUserProfileUseCase,
    changePasswordUseCase
);

export { logger, authController, adminController, userController, jwtService };
