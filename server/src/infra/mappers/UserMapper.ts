import { User } from "../../domain/entities/User";
import { IMapper } from "./IMapper";
import { IUserModel } from "../database/models/UserModel";
import { UserStatus } from "../../domain/enums/UserStatus";

export class UserMapper implements IMapper<User, IUserModel> {

    toDomain(persistence: IUserModel): User {
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
        const persistence: Partial<IUserModel> = {
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

        return Object.fromEntries(
            Object.entries(persistence).filter(([_, value]) => value !== undefined)
        ) as Partial<IUserModel>;
    }
}
