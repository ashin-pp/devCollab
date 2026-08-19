import { Plan } from "../../../domain/entities/plan.entity";
import { User } from "../../../domain/entities/user.entity";
import { SubscriptionStatus } from "../../../domain/enums/SubscriptionStatus";

export interface PlanEntitlement {
    /** Effective limits/features (Starter when a paid plan has expired). */
    plan: Plan;
    /** Plan used for billing/renew UI (the assigned catalog plan when present). */
    billingPlan: Plan;
    planSelectedAt: Date;
    planExpiresAt: Date;
    isExpired: boolean;
    subscriptionStatus: SubscriptionStatus;
}

export interface IPlanEntitlementService {
    resolveForUser(user: User): Promise<PlanEntitlement>;
    resolveForUserId(userId: string): Promise<PlanEntitlement>;
    /** Blocks paid actions when the assigned cycle has ended (create workspace, etc.). */
    assertSubscriptionActive(userId: string): Promise<PlanEntitlement>;
}
