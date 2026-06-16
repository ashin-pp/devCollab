export class ChannelMember {
    constructor(
        public channelId: string,
        public userId: string,
        public addedBy: string,
        public role: 'admin' | 'member' = 'member',
        public isActive: boolean = true,
        public joinedAt?: Date,
        public removedAt?: Date,
        public id?: string
    ) {}
}
