import { AIAgentType } from '../enums/AIAgentType';

export class AIAgent {
    constructor(
        public workspaceId: string,
        public name: string,
        public agentType: AIAgentType,
        public description: string,
        public config: Record<string, any> = {},
        public isActive: boolean = true,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}
}
