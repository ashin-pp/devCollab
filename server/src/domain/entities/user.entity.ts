import { UserStatus } from "../enums/UserStatus";
import { SubscriptionStatus } from "../enums/SubscriptionStatus";
import type { PaidPlanEntitlement } from "../types/paid-plan-entitlement";

export class User {
    constructor(
        public name: string,
        public email: string,
        public password?: string,
        public profileImage?: string,
        public bio?: string,
        public skills: string[] = [],
        public subscriptionStatus: SubscriptionStatus = SubscriptionStatus.STARTER,
        public github?: string,
        public linkedin?: string,
        public twitter?: string,
        public location?: string,
        public title?: string,
        public planId?: string | null,
        public planSelectedAt?: Date | null,
        public paidPlanEntitlements: PaidPlanEntitlement[] = [],
        public googleId?: string,
        public isVerified: boolean = false,
        public status: UserStatus = UserStatus.ACTIVE,
        public lastSeen?: Date,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}

    public verifyEmail(): void {
        this.isVerified = true;
    }

    public updateSubscription(newStatus: SubscriptionStatus): void {
        this.subscriptionStatus = newStatus;
    }

    public selectPlan(
        planId: string | null,
        subscriptionStatus?: SubscriptionStatus,
        planSelectedAt: Date | null = new Date()
    ): void {
        this.planId = planId;
        this.planSelectedAt = planSelectedAt;
        if (subscriptionStatus) {
            this.subscriptionStatus = subscriptionStatus;
        }
    }

    public getActivePaidEntitlement(planId: string, now: Date = new Date()): PaidPlanEntitlement | null {
        const active = this.paidPlanEntitlements.find(
            (item) => item.planId === planId && item.expiresAt.getTime() > now.getTime()
        );
        return active ?? null;
    }

    public grantPaidPlanEntitlement(input: {
        planId: string;
        durationDays: number;
        paymentId?: string;
        now?: Date;
    }): PaidPlanEntitlement {
        const now = input.now ?? new Date();
        const durationMs = Math.max(1, input.durationDays) * 24 * 60 * 60 * 1000;
        const existing = this.paidPlanEntitlements.find((item) => item.planId === input.planId);
        const base =
            existing && existing.expiresAt.getTime() > now.getTime() ? existing.expiresAt : now;
        const expiresAt = new Date(base.getTime() + durationMs);

        const next: PaidPlanEntitlement = {
            planId: input.planId,
            expiresAt,
            paymentId: input.paymentId ?? existing?.paymentId,
        };

        this.paidPlanEntitlements = [
            ...this.paidPlanEntitlements.filter((item) => item.planId !== input.planId),
            next,
        ];
        return next;
    }

    public pruneExpiredPaidEntitlements(now: Date = new Date()): void {
        this.paidPlanEntitlements = this.paidPlanEntitlements.filter(
            (item) => item.expiresAt.getTime() > now.getTime()
        );
    }

    public updateProfile(data: Partial<User>): void {
        Object.assign(this, data);
    }

    public deactivate(): void {
        this.status = UserStatus.INACTIVE;
    }
}
