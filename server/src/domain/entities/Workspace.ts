import { WorkspacePrivacy } from '../enums/WorkspacePrivacy';

export class Workspace {
    constructor(
        public name: string,
        public inviteCode: string,
        public createdBy: string,
        public description?: string,
        public logo?: string,
        public privacy: WorkspacePrivacy = WorkspacePrivacy.PRIVATE,
        public maxMembers: number = 50,
        public isActive: boolean = true,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date,
        private _currentMemberCount: number = 0
    ) {}

    public canAddMember(): boolean {
        return this._currentMemberCount < this.maxMembers;
    }

    public incrementMemberCount(): void {
        this._currentMemberCount++;
    }

    public setCurrentMemberCount(count: number): void {
        this._currentMemberCount = count;
    }

    public deactivate(): void {
        this.isActive = false;
    }

    public makePublic(): void {
        this.privacy = WorkspacePrivacy.PUBLIC;
    }

    public makePrivate(): void {
        this.privacy = WorkspacePrivacy.PRIVATE;
    }
}
