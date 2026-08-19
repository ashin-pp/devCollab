export class Conversation {
    constructor(
        public workspaceId: string,
        public participant1Id: string,
        public participant2Id: string,
        public lastMessageAt?: Date,
        public createdAt?: Date,
        public updatedAt?: Date,
        public id?: string
    ) {}
}
