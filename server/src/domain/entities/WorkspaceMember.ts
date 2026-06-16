export class WorkspaceMember {
    constructor(
        public workspaceId: string,
        public userId: string,
        public role: 'owner' | 'member' = 'member',
        public status: 'pending' | 'approved' | 'blocked' = 'approved',
        public joinedAt?: Date,
        public id?: string
    ) {}
}
