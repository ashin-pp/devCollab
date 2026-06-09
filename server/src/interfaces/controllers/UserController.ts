import { Response, NextFunction } from "express";
import { GetUserProfileUseCase } from "../../application/use-cases/user/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "../../application/use-cases/user/UpdateUserProfileUseCase";
import { ChangePasswordUseCase } from "../../application/use-cases/user/ChangePasswordUseCase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { AppError } from "../../domain/errors/AppError";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { UpdateUserProfileDTO } from "../../application/dtos/user/UpdateUserProfileDTO";
import { ChangePasswordDTO } from "../../application/dtos/user/ChangePasswordDTO";

export class UserController {
    constructor(
        private getUserProfileUseCase: GetUserProfileUseCase,
        private updateUserProfileUseCase: UpdateUserProfileUseCase,
        private changePasswordUseCase: ChangePasswordUseCase
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
}
