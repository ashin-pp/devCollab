import { User } from "../../domain/entities/User";
import { IMapper } from "./IMapper";
import { IUserModel } from "../database/models/UserModel";

export class UserMapper implements IMapper<User, IUserModel> {
    
    toDomain(persistence: IUserModel): User {
        return new User(
            persistence.name,
            persistence.username,
            persistence.email,
            persistence.password,
            persistence.profile_image,
            persistence.bio,
            persistence.skills,
            persistence.subscription_status,
            persistence.github,
            persistence.linkedin,
            persistence.twitter,
            persistence.google_id,
            persistence.is_verified,
            persistence.status,
            persistence.last_seen,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at,
            persistence.updated_at
        );
    }

    toPersistence(domain: Partial<User>): any {
        return {
            name: domain.name,
            username: domain.username,
            email: domain.email,
            password: domain.password,
            profile_image: domain.profileImage,
            bio: domain.bio,
            skills: domain.skills,
            subscription_status: domain.subscriptionStatus,
            github: domain.github,
            linkedin: domain.linkedin,
            twitter: domain.twitter,
            google_id: domain.googleId,
            is_verified: domain.isVerified,
            status: domain.status,
            last_seen: domain.lastSeen
        };
    }
}
