export class Message {
    constructor(
        public workspaceId: string,
        public channelId: string,
        public senderId: string,
        public content: string,
        public messageType: 'text' | 'image' | 'system' = 'text',
        public senderName?: string,
        public imageUrl?: string,
        public parentMessageId?: string,
        public threadRootId?: string,
        public isEdited: boolean = false,
        public isPinned: boolean = false,
        public seenBy: string[] = [],
        public expiresAt?: Date,
        public createdAt?: Date,
        public updatedAt?: Date,
        public id?: string
    ) {}
}
