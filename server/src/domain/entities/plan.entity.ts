export class Plan {
    constructor(
        public name: string,
        public price: number,
        public currency: string,
        public durationDays: number,
        public maxWorkspaces: number,
        public maxMembersPerWorkspace: number,
        public messageRetentionDays: number,
        public aiAssistantEnabled: boolean,
        public videoCallsEnabled: boolean,
        public multiAiAgents: boolean,
        public pinBoardEnabled: boolean,
        public createdBy: string,
        public isActive: boolean = true,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}
}
