import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { UserProfileResponseDto } from "../../dtos/user/response/user-profile.response.dto";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class GetUserProfileUseCase implements IBaseUseCase<{userId: string}, UserProfileResponseDto> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: {userId: string}): Promise<UserProfileResponseDto> {
        const { userId } = payload;
        const user = await this._userRepository.findById(userId);
        if (!user || !user.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            bio: user.bio,
            skills: user.skills || [],
            github: user.github,
            linkedin: user.linkedin,
            twitter: user.twitter,
            location: user.location,
            title: user.title
        };
    }
}
