import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import type { IStorageService } from "../../interfaces/services/storage.service.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { UserProfileResponseDto } from "../../dtos/user/response/user-profile.response.dto";
import { toProfilePlanSnapshot } from "../../mappers/profile-plan.mapper";

import { IGetUserProfileUseCase } from "../../interfaces/use-cases/user/get-user-profile.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class GetUserProfileUseCase implements IGetUserProfileUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService,
        @inject(SERVICE_TOKENS.IStorageService) private _storageService: IStorageService
    ) {}

    async execute(payload: { userId: string}): Promise<UserProfileResponseDto> {
        const { userId } = payload;
        const user = await this._userRepository.findById(userId);
        if (!user || !user.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const entitlement = await this._planEntitlementService.resolveForUser(user);
        const currentPlan = toProfilePlanSnapshot(entitlement.billingPlan);
        const now = Date.now();
        const paidPlanEntitlements = (user.paidPlanEntitlements ?? [])
            .filter((item) => item.expiresAt.getTime() > now)
            .map((item) => ({
                planId: item.planId,
                expiresAt: item.expiresAt.toISOString(),
            }));

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage
                ? await this._storageService.getSignedUrl(user.profileImage)
                : user.profileImage,
            bio: user.bio,
            skills: user.skills || [],
            github: user.github,
            linkedin: user.linkedin,
            twitter: user.twitter,
            location: user.location,
            title: user.title,
            planId: currentPlan.id,
            planSelectedAt: entitlement.planSelectedAt.toISOString(),
            planExpiresAt: entitlement.planExpiresAt.toISOString(),
            isSubscriptionExpired: entitlement.isExpired,
            subscriptionStatus: entitlement.subscriptionStatus,
            currentPlan,
            paidPlanEntitlements,
        };
    }
}
