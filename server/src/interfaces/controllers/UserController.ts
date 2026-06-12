import { Response, NextFunction } from "express";
import { GetUserProfileUseCase } from "../../application/use-cases/user/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "../../application/use-cases/user/UpdateUserProfileUseCase";
import { ChangePasswordUseCase } from "../../application/use-cases/user/ChangePasswordUseCase";
import { UploadProfileImageUseCase } from "../../application/use-cases/user/UploadProfileImageUseCase";
import { DeleteProfileImageUseCase } from "../../application/use-cases/user/DeleteProfileImageUseCase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { AppError } from "../../domain/errors/AppError";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { UpdateUserProfileDTO } from "../../application/dtos/user/UpdateUserProfileDTO";
import { ChangePasswordDTO } from "../../application/dtos/user/ChangePasswordDTO";

import { RequestEmailChangeUseCase } from "../../application/use-cases/user/RequestEmailChangeUseCase";
import { VerifyEmailChangeUseCase } from "../../application/use-cases/user/VerifyEmailChangeUseCase";

export class UserController {
    constructor(
        private getUserProfileUseCase: GetUserProfileUseCase,
        private updateUserProfileUseCase: UpdateUserProfileUseCase,
        private changePasswordUseCase: ChangePasswordUseCase,
        private requestEmailChangeUseCase: RequestEmailChangeUseCase,
        private verifyEmailChangeUseCase: VerifyEmailChangeUseCase,
        private uploadProfileImageUseCase: UploadProfileImageUseCase,
        private deleteProfileImageUseCase: DeleteProfileImageUseCase
    ) {}

    public getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const profile = await this.getUserProfileUseCase.execute(userId);
            
            res.status(HttpStatusCode.OK).json(
                ApiResponse.success(SuccessMessage.PROFILE_RETRIEVED, profile)
            );
        } catch (error) {
            next(error);
        }
    };

    public updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const updateData: UpdateUserProfileDTO = req.body;
            const updatedProfile = await this.updateUserProfileUseCase.execute(userId, updateData);
            
            res.status(HttpStatusCode.OK).json(
                ApiResponse.success(SuccessMessage.PROFILE_UPDATED, updatedProfile)
            );
        } catch (error) {
            next(error);
        }
    };

    public changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const passwordData: ChangePasswordDTO = req.body;
            await this.changePasswordUseCase.execute(userId, passwordData);
            
            res.status(HttpStatusCode.OK).json(
                ApiResponse.success(SuccessMessage.PASSWORD_CHANGED, null)
            );
        } catch (error) {
            next(error);
        }
    };

    public requestEmailChange = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const { newEmail } = req.body;
            await this.requestEmailChangeUseCase.execute(userId, newEmail);
            
            res.status(HttpStatusCode.OK).json(
                ApiResponse.success("OTP sent to your current email address", null)
            );
        } catch (error) {
            next(error);
        }
    };

    public verifyEmailChange = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const { newEmail, otp } = req.body;
            await this.verifyEmailChangeUseCase.execute(userId, newEmail, otp);
            
            res.status(HttpStatusCode.OK).json(
                ApiResponse.success("Email updated successfully", null)
            );
        } catch (error) {
            next(error);
        }
    };
    public uploadProfileImage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const file = req.file;
            if (!file) throw new AppError("No file uploaded", HttpStatusCode.BAD_REQUEST);

            const updatedProfile = await this.uploadProfileImageUseCase.execute(userId, file.buffer, file.originalname, file.mimetype);
            
            res.status(HttpStatusCode.OK).json(
                ApiResponse.success("Profile image updated successfully", updatedProfile)
            );
        } catch (error) {
            next(error);
        }
    };

    public deleteProfileImage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const updatedProfile = await this.deleteProfileImageUseCase.execute(userId);
            
            res.status(HttpStatusCode.OK).json(
                ApiResponse.success("Profile image removed successfully", updatedProfile)
            );
        } catch (error) {
            next(error);
        }
    };
}
