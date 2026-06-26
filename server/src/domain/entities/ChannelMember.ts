export class ChannelMember {
    constructor(
        public channelId: string,
        public userId: string,
        public addedBy: string,
        public role: 'admin' | 'member' = 'member',
        public isActive: boolean = true,
        public status: 'pending' | 'approved' | 'rejected' = 'approved',
        public joinedAt?: Date,
        public removedAt?: Date,
        public lastReadAt?: Date,
        public id?: string
    ) {}

    public approve(): void {
        this.status = 'approved';
        this.isActive = true;
    }

    public reject(): void {
        this.status = 'rejected';
        this.isActive = false;
    }

    public promoteToAdmin(): void {
        this.role = 'admin';
    }

    public remove(): void {
        this.isActive = false;
        this.removedAt = new Date();
    }
}
