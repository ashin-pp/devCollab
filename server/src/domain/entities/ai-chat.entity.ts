import { AIAgentType } from "../enums/AIAgentType";

export class AIChat {
    constructor(
        public userId: string,
        public workspaceId: string,
        public channelId: string,
        public command: AIAgentType,
        public prompt: string,
        public response: string,
        public id?: string,
        public createdAt?: Date
    ) {}
}
