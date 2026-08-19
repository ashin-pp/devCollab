export class AIReminder {
    constructor(
        public userId: string,
        public workspaceId: string,
        public channelId: string,
        public agentId: string,
        public messageId: string,
        public content: string,
        public remindAt: Date,
        public isSent: boolean = false,
        public id?: string,
        public createdAt?: Date,
        public senderId?: string
    ) {}
}
