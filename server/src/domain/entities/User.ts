import { SubscriptionStatus } from "../enums/SubscriptionStatus";

export class User {
    constructor(
        public name: string,
        public username: string,
        public email: string,
        public password?: string,
        public profileImage?: string,
        public bio?: string,
        public skills: string[] = [],
        public subscriptionStatus: SubscriptionStatus = SubscriptionStatus.STARTER,

        public github?: string,
        public linkedin?: string,
        public twitter?: string,
        public googleId?: string,
        public isVerified: boolean = false,
        public status: string = "active",
        public lastSeen?: Date,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }


    public verifyEmail(): void {
        this.isVerified = true;
    }
}
