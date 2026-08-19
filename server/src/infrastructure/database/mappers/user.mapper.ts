import { User } from "../../../domain/entities/user.entity";
import { IMapper } from "../../../application/interfaces/IMapper";
import { IUserModel } from "../models/user.model";
import { UserStatus } from "../../../domain/enums/UserStatus";
import type { PaidPlanEntitlement } from "../../../domain/types/paid-plan-entitlement";

export class UserMapper implements IMapper<User, IUserModel> {

    toDomain(persistence: IUserModel): User {
        const entitlements: PaidPlanEntitlement[] = (persistence.paid_plan_entitlements ?? []).map(
            (item) => ({
                planId: item.plan_id.toString(),
                expiresAt: new Date(item.expires_at),
                paymentId: item.payment_id,
            })
        );

        return new User(
            persistence.name,
            persistence.email,
            persistence.password,
            persistence.profile_image,
            persistence.bio,
            persistence.skills,
            persistence.subscription_status,
            persistence.github,
            persistence.linkedin,
            persistence.twitter,
            persistence.location,
            persistence.title,
            persistence.plan_id ? persistence.plan_id.toString() : persistence.plan_id === null ? null : undefined,
            persistence.plan_selected_at ?? null,
            entitlements,
            persistence.google_id,
            persistence.is_verified,
            (persistence.status as UserStatus) ?? UserStatus.ACTIVE,
            persistence.last_seen,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at,
            persistence.updated_at
        );
    }

    toPersistence(domain: Partial<User>): Partial<IUserModel> {
        const persistence: Record<string, unknown> = {
            name: domain.name,
            email: domain.email,
            password: domain.password,
            profile_image: domain.profileImage,
            bio: domain.bio,
            skills: domain.skills,
            subscription_status: domain.subscriptionStatus,
            github: domain.github,
            linkedin: domain.linkedin,
            twitter: domain.twitter,
            location: domain.location,
            title: domain.title,
            google_id: domain.googleId,
            is_verified: domain.isVerified,
            status: domain.status,
            last_seen: domain.lastSeen,
        };

        if (domain.planId !== undefined) {
            persistence.plan_id = domain.planId;
        }

        if (domain.planSelectedAt !== undefined) {
            persistence.plan_selected_at = domain.planSelectedAt;
        }

        if (domain.paidPlanEntitlements !== undefined) {
            persistence.paid_plan_entitlements = domain.paidPlanEntitlements.map((item) => ({
                plan_id: item.planId,
                expires_at: item.expiresAt,
                payment_id: item.paymentId,
            }));
        }

        return Object.fromEntries(
            Object.entries(persistence).filter(([_, value]) => value !== undefined)
        ) as Partial<IUserModel>;
    }
}
