import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { UpdateUserProfileRequestDto } from "../../dtos/user/request/update-user-profile.dto";
import { UserProfileResponseDto } from "../../dtos/user/response/user-profile.response.dto";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class UpdateUserProfileUseCase implements IBaseUseCase<{userId: string, data: UpdateUserProfileRequestDto}, UserProfileResponseDto> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: {userId: string, data: UpdateUserProfileRequestDto}): Promise<UserProfileResponseDto> {
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
            title: updatedUser.title
        };
    }
}
