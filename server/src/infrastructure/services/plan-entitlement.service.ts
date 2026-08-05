import { inject, injectable } from "tsyringe";
import type { IPlanRepository } from "../../application/interfaces/repositories/plan.repository.interface";
import type { IUserRepository } from "../../application/interfaces/repositories/user.repository.interface";
import type {
    IPlanEntitlementService,
    PlanEntitlement,
} from "../../application/interfaces/services/plan-entitlement.service.interface";
import { User } from "../../domain/entities/user.entity";
import { Plan } from "../../domain/entities/plan.entity";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SubscriptionStatus } from "../../domain/enums/SubscriptionStatus";
import { AppError } from "../../domain/errors/AppError";
import { REPOSITORY_TOKENS } from "../di/repository.tokens";

@injectable()
export class PlanEntitlementService implements IPlanEntitlementService {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private readonly _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IPlanRepository) private readonly _planRepository: IPlanRepository
    ) {}

    async resolveForUserId(userId: string): Promise<PlanEntitlement> {
        const user = await this._userRepository.findById(userId);
        if (!user || !user.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        return this.resolveForUser(user);
    }

    async resolveForUser(user: User): Promise<PlanEntitlement> {
        await this.ensurePlanSelectedAt(user);

        if (user.planId) {
            const assigned = await this._planRepository.findById(user.planId);
            if (assigned) {
                const assignedEntitlement = this.buildEntitlement(assigned, user.planSelectedAt as Date);

                // Soft-deleted plans stay until expiry, then detach to Starter.
                if (!assigned.isActive && assignedEntitlement.isExpired) {
                    await this.detachExpiredDeletedPlan(user);
                    return this.resolveStarterEntitlement(user);
                }

                // Non-starter plan expired: keep billing plan for renew UI, apply Starter limits for access.
                if (assignedEntitlement.isExpired) {
                    const starter = await this.requireStarterPlan();
                    return {
                        plan: starter,
                        billingPlan: assigned,
                        planSelectedAt: assignedEntitlement.planSelectedAt,
                        planExpiresAt: assignedEntitlement.planExpiresAt,
                        isExpired: true,
                        subscriptionStatus: this.mapPlanNameToStatus(assigned.name),
                    };
                }

                return assignedEntitlement;
            }
        }

        return this.resolveStarterEntitlement(user);
    }

    async assertSubscriptionActive(userId: string): Promise<PlanEntitlement> {
        const entitlement = await this.resolveForUserId(userId);
        if (entitlement.isExpired) {
            throw new AppError(ErrorMessage.SUBSCRIPTION_EXPIRED, HttpStatusCode.FORBIDDEN);
        }
        return entitlement;
    }

    private async resolveStarterEntitlement(user: User): Promise<PlanEntitlement> {
        const starter = await this.requireStarterPlan();
        const planSelectedAt = user.planSelectedAt ?? (await this.ensurePlanSelectedAt(user));
        return this.buildEntitlement(starter, planSelectedAt);
    }

    private async requireStarterPlan(): Promise<Plan> {
        const starter = await this._planRepository.findActiveByNameContains(SubscriptionStatus.STARTER);
        if (!starter) {
            throw new AppError(ErrorMessage.STARTER_PLAN_NOT_CONFIGURED, HttpStatusCode.INTERNAL_SERVER);
        }
        return starter;
    }

    private buildEntitlement(plan: Plan, planSelectedAt: Date): PlanEntitlement {
        const planExpiresAt = new Date(planSelectedAt);
        planExpiresAt.setDate(planExpiresAt.getDate() + Math.max(1, plan.durationDays || 1));

        const status = this.mapPlanNameToStatus(plan.name);
        const isStarterNamed = plan.name.toLowerCase().includes(SubscriptionStatus.STARTER);
        // Starter is the free fallback — do not soft-lock chat or create flows on its cycle.
        const isExpired = isStarterNamed ? false : Date.now() > planExpiresAt.getTime();

        return {
            plan,
            billingPlan: plan,
            planSelectedAt,
            planExpiresAt,
            isExpired,
            subscriptionStatus: status,
        };
    }

    private async detachExpiredDeletedPlan(user: User): Promise<void> {
        if (!user.id) {
            return;
        }
        user.selectPlan(null, SubscriptionStatus.STARTER, new Date());
        await this._userRepository.update(user.id, user);
    }

    private async ensurePlanSelectedAt(user: User): Promise<Date> {
        if (user.planSelectedAt) {
            return user.planSelectedAt;
        }

        const selectedAt = new Date();
        if (!user.id) {
            return selectedAt;
        }

        user.planSelectedAt = selectedAt;
        await this._userRepository.update(user.id, user);
        return selectedAt;
    }

    private mapPlanNameToStatus(name: string): SubscriptionStatus {
        const planName = name.toLowerCase();
        if (planName.includes(SubscriptionStatus.ENTERPRISE)) {
            return SubscriptionStatus.ENTERPRISE;
        }
        if (planName.includes(SubscriptionStatus.PROFESSIONAL)) {
            return SubscriptionStatus.PROFESSIONAL;
        }
        return SubscriptionStatus.STARTER;
    }
}
