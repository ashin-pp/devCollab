export class Workspace {
    constructor(
        public name: string,
        public inviteCode: string,
        public createdBy: string,
        public description?: string,
        public logo?: string,
        public privacy: 'public' | 'private' = 'private',
        public maxMembers: number = 50,
        public isActive: boolean = true,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}
}
