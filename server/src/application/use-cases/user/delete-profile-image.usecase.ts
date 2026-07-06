import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IStorageService } from "../../../application/interfaces/services/storage.service.interface";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { UserProfileResponseDto } from "../../dtos/user/response/user-profile.response.dto";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class DeleteProfileImageUseCase implements IBaseUseCase<{userId: string}, UserProfileResponseDto> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.IStorageService) private _storageService: IStorageService
    ) {}

    async execute(payload: {userId: string}): Promise<UserProfileResponseDto> {
        const { userId } = payload;
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (user.profileImage) {
            await this._storageService.deleteFile(user.profileImage);
            
            await this._userRepository.update(userId, { profileImage: "" });
        }
        
        const updatedUser = await this._userRepository.findById(userId);
        if (!updatedUser || !updatedUser.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
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
