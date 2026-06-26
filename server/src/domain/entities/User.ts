import { UserStatus } from '../enums/UserStatus';
import { SubscriptionStatus } from '../enums/SubscriptionStatus';

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

    public updateProfile(data: Partial<User>): void {
        Object.assign(this, data);
    }

    public deactivate(): void {
        this.status = UserStatus.INACTIVE;
    }
}
