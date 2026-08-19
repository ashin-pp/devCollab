export class OtpVerification {
    constructor(
        public email: string,
        public otp: string,
        public expiresAt: Date,
        public isUsed: boolean = false,
        public id?: string,
        public createdAt?: Date
    ) { }
    public isExpired(): boolean {
        return new Date() > this.expiresAt;
    }
    public markAsUsed(): void {
        this.isUsed = true;
    }
}


