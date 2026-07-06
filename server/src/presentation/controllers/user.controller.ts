import { injectable, inject } from 'tsyringe';
import { Response, NextFunction } from "express";
import { GetUserProfileUseCase } from "../../application/use-cases/user/get-user-profile.usecase";
import { UpdateUserProfileUseCase } from "../../application/use-cases/user/update-user-profile.usecase";
import { ChangePasswordUseCase } from "../../application/use-cases/user/change-password.usecase";
import { UploadProfileImageUseCase } from "../../application/use-cases/user/upload-profile-image.usecase";
import { DeleteProfileImageUseCase } from "../../application/use-cases/user/delete-profile-image.usecase";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { AppError } from "../../domain/errors/AppError";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { UpdateUserProfileRequestDto } from "../../application/dtos/user/request/update-user-profile.dto";
import { ChangePasswordRequestDto } from "../../application/dtos/user/request/change-password.dto";

import { RequestEmailChangeUseCase } from "../../application/use-cases/user/request-email-change.usecase";
import { VerifyEmailChangeUseCase } from "../../application/use-cases/user/verify-email-change.usecase";

import { SearchUserByEmailUseCase } from "../../application/use-cases/user/search-user-by-email.usecase";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class UserController {
    constructor(
        @inject(GetUserProfileUseCase) private readonly _getUserProfileUseCase: GetUserProfileUseCase,
        @inject(UpdateUserProfileUseCase) private readonly _updateUserProfileUseCase: UpdateUserProfileUseCase,
        @inject(ChangePasswordUseCase) private readonly _changePasswordUseCase: ChangePasswordUseCase,
        @inject(RequestEmailChangeUseCase) private readonly _requestEmailChangeUseCase: RequestEmailChangeUseCase,
        @inject(VerifyEmailChangeUseCase) private readonly _verifyEmailChangeUseCase: VerifyEmailChangeUseCase,
        @inject(UploadProfileImageUseCase) private readonly _uploadProfileImageUseCase: UploadProfileImageUseCase,
        @inject(DeleteProfileImageUseCase) private readonly _deleteProfileImageUseCase: DeleteProfileImageUseCase,
        @inject(SearchUserByEmailUseCase) private readonly _searchUserByEmailUseCase: SearchUserByEmailUseCase
    ) {}

    public getProfile = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        const profile = await this._getUserProfileUseCase.execute({userId});
        res.status(HttpStatusCode.OK).json(
                        ApiResponse.success(SuccessMessage.PROFILE_RETRIEVED, profile)
                    );
        });

    public updateProfile = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        const updateData: UpdateUserProfileRequestDto = req.body;
        const updatedProfile = await this._updateUserProfileUseCase.execute({ userId, data: updateData });
        res.status(HttpStatusCode.OK).json(
                        ApiResponse.success(SuccessMessage.PROFILE_UPDATED, updatedProfile)
                    );
        });

    public changePassword = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        const passwordData: ChangePasswordRequestDto = req.body;
        await this._changePasswordUseCase.execute({ userId, dto: passwordData });
        res.status(HttpStatusCode.OK).json(
                        ApiResponse.success(SuccessMessage.PASSWORD_CHANGED, null)
                    );
        });

    public requestEmailChange = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        const { newEmail } = req.body;
        await this._requestEmailChangeUseCase.execute({ userId, newEmail });
        res.status(HttpStatusCode.OK).json(
                        ApiResponse.success("OTP sent to your current email address", null)
                    );
        });

    public verifyEmailChange = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        const { newEmail, otp } = req.body;
        await this._verifyEmailChangeUseCase.execute({ userId, newEmail, otp });
        res.status(HttpStatusCode.OK).json(
                        ApiResponse.success("Email updated successfully", null)
                    );
        });
    public uploadProfileImage = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        const file = req.file;
        if (!file) throw new AppError("No file uploaded", HttpStatusCode.BAD_REQUEST);
        const updatedProfile = await this._uploadProfileImageUseCase.execute({ 
            userId, 
            fileBuffer: file.buffer, 
            fileName: file.originalname, 
            contentType: file.mimetype 
        });
        res.status(HttpStatusCode.OK).json(
                        ApiResponse.success("Profile image updated successfully", updatedProfile)
                    );
        });

    public deleteProfileImage = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        const updatedProfile = await this._deleteProfileImageUseCase.execute({userId});
        res.status(HttpStatusCode.OK).json(
                        ApiResponse.success("Profile image removed successfully", updatedProfile)
                    );
        });

    public searchByEmail = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { email } = req.query;
        if (!email || typeof email !== 'string') {
                        throw new AppError("Valid email query parameter is required", HttpStatusCode.BAD_REQUEST);
                    }
        const user = await this._searchUserByEmailUseCase.execute({email: email as string});
        res.status(HttpStatusCode.OK).json(
                        ApiResponse.success("User found", user)
                    );
        });
}
