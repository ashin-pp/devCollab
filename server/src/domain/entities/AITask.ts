import { AITaskStatus } from '../enums/AITaskStatus';

export class AITask {
    constructor(
        public workspaceId: string,
        public channelId: string,
        public createdBy: string,
        public agentId: string,
        public title: string,
        public description: string,
        public assignedTo: string,
        public dueDate: Date,
        public status: AITaskStatus = AITaskStatus.OPEN,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}
}
