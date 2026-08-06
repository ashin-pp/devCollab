import { inject, injectable } from "tsyringe";
import type { IPlanRepository } from "../../interfaces/repositories/plan.repository.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { SubscriptionStatus } from "../../../domain/enums/SubscriptionStatus";
import { AppError } from "../../../domain/errors/AppError";
import { isFreePlan } from "../../../domain/utils/is-free-plan";
import { SelectUserPlanRequestDto } from "../../dtos/user/request/select-user-plan.dto";
import { UserProfileResponseDto } from "../../dtos/user/response/user-profile.response.dto";
import { toProfilePlanSnapshot } from "../../mappers/profile-plan.mapper";
import { ISelectUserPlanUseCase } from "../../interfaces/use-cases/user/select-user-plan.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

const DAY_MS = 24 * 60 * 60 * 1000;

const resolveSubscriptionStatus = (planName: string): SubscriptionStatus => {
    const name = planName.toLowerCase();
    if (name.includes(SubscriptionStatus.ENTERPRISE)) return SubscriptionStatus.ENTERPRISE;
    if (name.includes(SubscriptionStatus.PROFESSIONAL)) return SubscriptionStatus.PROFESSIONAL;
    if (name.includes(SubscriptionStatus.STARTER)) return SubscriptionStatus.STARTER;
    return SubscriptionStatus.STARTER;
};

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

        user.pruneExpiredPaidEntitlements();

        if (data.planId === null || data.planId === undefined || data.planId === "") {
            user.selectPlan(null, SubscriptionStatus.STARTER, new Date());
        } else {
            const plan = await this._planRepository.findById(data.planId);
            if (!plan || !plan.id) {
                throw new AppError(ErrorMessage.PLAN_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }
            if (!plan.isActive) {
                throw new AppError(ErrorMessage.PLAN_INACTIVE, HttpStatusCode.BAD_REQUEST);
            }

            const subscriptionStatus = resolveSubscriptionStatus(plan.name);

            if (isFreePlan(plan)) {
                const onSamePlan = user.planId === plan.id;
                if (onSamePlan && user.planSelectedAt) {
                    const expiresAt = new Date(user.planSelectedAt);
                    expiresAt.setDate(expiresAt.getDate() + Math.max(1, plan.durationDays || 1));
                    if (Date.now() > expiresAt.getTime()) {
                        throw new AppError(ErrorMessage.FREE_TRIAL_ENDED, HttpStatusCode.FORBIDDEN);
                    }
                    // Already on an active free plan — no clock reset.
                } else {
                    user.selectPlan(plan.id, subscriptionStatus, new Date());
                }
            } else {
                const paid = user.getActivePaidEntitlement(plan.id);
                if (!paid) {
                    throw new AppError(ErrorMessage.PAYMENT_REQUIRED, HttpStatusCode.PAYMENT_REQUIRED);
                }
                const planSelectedAt = new Date(
                    paid.expiresAt.getTime() - Math.max(1, plan.durationDays) * DAY_MS
                );
                user.selectPlan(plan.id, subscriptionStatus, planSelectedAt);
            }
        }

        const updatedUser = await this._userRepository.update(userId, user);
        if (!updatedUser || !updatedUser.id) {
            throw new AppError(ErrorMessage.FAILED_TO_UPDATE_PROFILE, HttpStatusCode.INTERNAL_SERVER);
        }

        const entitlement = await this._planEntitlementService.resolveForUser(updatedUser);
        const currentPlan = toProfilePlanSnapshot(entitlement.billingPlan);
        const now = Date.now();
        const paidPlanEntitlements = (updatedUser.paidPlanEntitlements ?? [])
            .filter((item) => item.expiresAt.getTime() > now)
            .map((item) => ({
                planId: item.planId,
                expiresAt: item.expiresAt.toISOString(),
            }));

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
            paidPlanEntitlements,
        };
    }
}
