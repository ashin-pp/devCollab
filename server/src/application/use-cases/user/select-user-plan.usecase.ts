import { inject, injectable } from 'tsyringe';
import type { IPlanRepository } from "../../interfaces/repositories/plan.repository.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { SubscriptionStatus } from "../../../domain/enums/SubscriptionStatus";
import { AppError } from "../../../domain/errors/AppError";
import { SelectUserPlanRequestDto } from "../../dtos/user/request/select-user-plan.dto";
import { UserProfileResponseDto } from "../../dtos/user/response/user-profile.response.dto";
import { toProfilePlanSnapshot } from "../../mappers/profile-plan.mapper";
import { ISelectUserPlanUseCase } from "../../interfaces/use-cases/user/select-user-plan.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class SelectUserPlanUseCase implements ISelectUserPlanUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private readonly _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IPlanRepository) private readonly _planRepository: IPlanRepository,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private readonly _planEntitlementService: IPlanEntitlementService
    ) {}

    async execute(payload: { userId: string; data: SelectUserPlanRequestDto }): Promise<UserProfileResponseDto> {
        const { userId, data } = payload;
        const user = await this._userRepository.findById(userId);
        if (!user || !user.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (data.planId === null || data.planId === undefined || data.planId === '') {
            user.selectPlan(null, SubscriptionStatus.STARTER, new Date());
        } else {
            const plan = await this._planRepository.findById(data.planId);
            if (!plan || !plan.id) {
                throw new AppError(ErrorMessage.PLAN_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }
            if (!plan.isActive) {
                throw new AppError(ErrorMessage.PLAN_INACTIVE, HttpStatusCode.BAD_REQUEST);
            }

            const planName = plan.name.toLowerCase();
            let subscriptionStatus = SubscriptionStatus.STARTER;
            if (planName.includes(SubscriptionStatus.ENTERPRISE)) {
                subscriptionStatus = SubscriptionStatus.ENTERPRISE;
            } else if (planName.includes(SubscriptionStatus.PROFESSIONAL)) {
                subscriptionStatus = SubscriptionStatus.PROFESSIONAL;
            } else if (planName.includes(SubscriptionStatus.STARTER)) {
                subscriptionStatus = SubscriptionStatus.STARTER;
            }

            user.selectPlan(plan.id, subscriptionStatus, new Date());
        }

        const updatedUser = await this._userRepository.update(userId, user);
        if (!updatedUser || !updatedUser.id) {
            throw new AppError(ErrorMessage.FAILED_TO_UPDATE_PROFILE, HttpStatusCode.INTERNAL_SERVER);
        }

        const entitlement = await this._planEntitlementService.resolveForUser(updatedUser);
        const currentPlan = toProfilePlanSnapshot(entitlement.billingPlan);

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
            planId: currentPlan.id,
            planSelectedAt: entitlement.planSelectedAt.toISOString(),
            planExpiresAt: entitlement.planExpiresAt.toISOString(),
            isSubscriptionExpired: entitlement.isExpired,
            subscriptionStatus: entitlement.subscriptionStatus,
            currentPlan,
        };
    }
}
