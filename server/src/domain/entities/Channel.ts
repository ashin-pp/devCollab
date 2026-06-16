export class Channel {
    constructor(
        public workspaceId: string,
        public name: string,
        public description: string | undefined,
        public createdBy: string,
        public privacy: 'public' | 'private' = 'public',
        public isActive: boolean = true,
        public createdAt?: Date,
        public updatedAt?: Date,
        public id?: string
    ) {}
}
