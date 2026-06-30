export class AISummary {
    constructor(
        public workspaceId: string,
        public channelId: string,
        public requestedBy: string,
        public agentId: string,
        public summaryText: string,
        public fromMessageId: string,
        public toMessageId: string,
        public periodStart: Date,
        public periodEnd: Date,
        public isPinned: boolean = false,
        public id?: string,
        public createdAt?: Date
    ) {}
}
