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
        public id?: string,
        public isMember?: boolean,
        public hasPendingRequest?: boolean
    ) { }

    public archive(): void {
        this.isActive = false;
    }

    public makePrivate(): void {
        this.privacy = 'private';
    }

    public makePublic(): void {
        this.privacy = 'public';
    }

    public updateDescription(newDescription: string): void {
        this.description = newDescription;
    }
}
