import { Response } from "express";
import { inject, injectable } from "tsyringe";
import { ChangePasswordRequestDto } from "../../application/dtos/user/request/change-password.dto";
import { SelectUserPlanRequestDto } from "../../application/dtos/user/request/select-user-plan.dto";
import { UpdateUserProfileRequestDto } from "../../application/dtos/user/request/update-user-profile.dto";
import type { IChangePasswordUseCase } from "../../application/interfaces/use-cases/user/change-password.usecase.interface";
import type { IDeleteProfileImageUseCase } from "../../application/interfaces/use-cases/user/delete-profile-image.usecase.interface";
import type { IGetUserProfileUseCase } from "../../application/interfaces/use-cases/user/get-user-profile.usecase.interface";
import type { IRequestEmailChangeUseCase } from "../../application/interfaces/use-cases/user/request-email-change.usecase.interface";
import type { ISearchUserByEmailUseCase } from "../../application/interfaces/use-cases/user/search-user-by-email.usecase.interface";
import type { ISelectUserPlanUseCase } from "../../application/interfaces/use-cases/user/select-user-plan.usecase.interface";
import type { IUpdateUserProfileUseCase } from "../../application/interfaces/use-cases/user/update-user-profile.usecase.interface";
import type { IUploadProfileImageUseCase } from "../../application/interfaces/use-cases/user/upload-profile-image.usecase.interface";
import type { IVerifyEmailChangeUseCase } from "../../application/interfaces/use-cases/user/verify-email-change.usecase.interface";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { AppError } from "../../domain/errors/AppError";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";
import { requireUserId } from "../utils/require-user-id";

@injectable()
export class UserController {
    constructor(
        @inject(USECASE_TOKENS.IGetUserProfileUseCase)
        private readonly _getUserProfileUseCase: IGetUserProfileUseCase,
        @inject(USECASE_TOKENS.IUpdateUserProfileUseCase)
        private readonly _updateUserProfileUseCase: IUpdateUserProfileUseCase,
        @inject(USECASE_TOKENS.ISelectUserPlanUseCase)
        private readonly _selectUserPlanUseCase: ISelectUserPlanUseCase,
        @inject(USECASE_TOKENS.IChangePasswordUseCase)
        private readonly _changePasswordUseCase: IChangePasswordUseCase,
        @inject(USECASE_TOKENS.IRequestEmailChangeUseCase)
        private readonly _requestEmailChangeUseCase: IRequestEmailChangeUseCase,
        @inject(USECASE_TOKENS.IVerifyEmailChangeUseCase)
        private readonly _verifyEmailChangeUseCase: IVerifyEmailChangeUseCase,
        @inject(USECASE_TOKENS.IUploadProfileImageUseCase)
        private readonly _uploadProfileImageUseCase: IUploadProfileImageUseCase,
        @inject(USECASE_TOKENS.IDeleteProfileImageUseCase)
        private readonly _deleteProfileImageUseCase: IDeleteProfileImageUseCase,
        @inject(USECASE_TOKENS.ISearchUserByEmailUseCase)
        private readonly _searchUserByEmailUseCase: ISearchUserByEmailUseCase
    ) {}

    getProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const profile = await this._getUserProfileUseCase.execute({ userId });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.PROFILE_RETRIEVED, profile)
        );
    });

    updateProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const updateData: UpdateUserProfileRequestDto = req.body;
        const updatedProfile = await this._updateUserProfileUseCase.execute({
            userId,
            data: updateData,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.PROFILE_UPDATED, updatedProfile)
        );
    });

    selectPlan = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const body = req.body as SelectUserPlanRequestDto;
        const updatedProfile = await this._selectUserPlanUseCase.execute({
            userId,
            data: { planId: body.planId === null ? null : body.planId.trim() },
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.PLAN_SELECTED, updatedProfile)
        );
    });

    changePassword = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const passwordData: ChangePasswordRequestDto = req.body;
        await this._changePasswordUseCase.execute({ userId, dto: passwordData });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.PASSWORD_CHANGED, null)
        );
    });

    requestEmailChange = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const { newEmail } = req.body;
        await this._requestEmailChangeUseCase.execute({ userId, newEmail });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.EMAIL_CHANGE_OTP_SENT, null)
        );
    });

    verifyEmailChange = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const { newEmail, otp } = req.body;
        await this._verifyEmailChangeUseCase.execute({ userId, newEmail, otp });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.EMAIL_UPDATED, null)
        );
    });

    uploadProfileImage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const file = req.file;
        if (!file) {
            throw new AppError(ErrorMessage.NO_FILE_UPLOADED, HttpStatusCode.BAD_REQUEST);
        }
        const updatedProfile = await this._uploadProfileImageUseCase.execute({
            userId,
            fileBuffer: file.buffer,
            fileName: file.originalname,
            contentType: file.mimetype,
        });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.PROFILE_IMAGE_UPDATED, updatedProfile)
        );
    });

    deleteProfileImage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const updatedProfile = await this._deleteProfileImageUseCase.execute({ userId });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.PROFILE_IMAGE_REMOVED, updatedProfile)
        );
    });

    searchByEmail = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const { email } = req.query;
        const user = await this._searchUserByEmailUseCase.execute({ email: email as string });
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.USER_FOUND, user)
        );
    });
}
