import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { UpdateUserProfileRequestDto } from "../../dtos/user/request/update-user-profile.dto";
import { UserProfileResponseDto } from "../../dtos/user/response/user-profile.response.dto";

import { IUpdateUserProfileUseCase } from "../../interfaces/use-cases/user/update-user-profile.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: { userId: string, data: UpdateUserProfileRequestDto}): Promise<UserProfileResponseDto> {
        const { userId, data } = payload;
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        user.updateProfile(data);

        const updatedUser = await this._userRepository.update(userId, user);
        if (!updatedUser || !updatedUser.id) {
             throw new AppError(ErrorMessage.FAILED_TO_UPDATE_PROFILE, HttpStatusCode.INTERNAL_SERVER);
        }
        
        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImage: updatedUser.profileImage,
            bio: updatedUser.bio,
            skills: updatedUser.skills || [],
            github: updatedUser.github,
            linkedin: updatedUser.linkedin,
            twitter: updatedUser.twitter,
            location: updatedUser.location,
            title: updatedUser.title,
            planId: updatedUser.planId ?? null,
            subscriptionStatus: updatedUser.subscriptionStatus,
        };
    }
}
