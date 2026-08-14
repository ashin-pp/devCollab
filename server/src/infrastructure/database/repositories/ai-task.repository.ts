import { injectable } from 'tsyringe';
import { IAITaskRepository } from "../../../application/interfaces/repositories/ai-task.repository.interface";
import { AITask } from "../../../domain/entities/ai-task.entity";
import { AITaskStatus } from "../../../domain/enums/AITaskStatus";
import { AITaskModel } from "../models/ai-task.model";

import { AITaskMapper } from "../mappers/ai-task.mapper";

@injectable()
export class AITaskRepository implements IAITaskRepository {
    private _mapper: AITaskMapper;

    constructor() {
        this._mapper = new AITaskMapper();
    }

    async create(task: Partial<AITask>): Promise<AITask> {
        const createdTask = new AITaskModel({
            workspace_id: task.workspaceId,
            channel_id: task.channelId,
            created_by: task.createdBy,
            agent_id: task.agentId,
            title: task.title,
            description: task.description,
            assigned_to: task.assignedTo,
            due_date: task.dueDate,
            status: task.status
        });
        const savedTask = await createdTask.save();
        return this._mapper.toDomain(savedTask);
    }

    async findById(id: string): Promise<AITask | null> {
        const task = await AITaskModel.findById(id);
        return task ? this._mapper.toDomain(task) : null;
    }

    async findByWorkspace(workspaceId: string): Promise<AITask[]> {
        const tasks = await AITaskModel.find({ workspace_id: workspaceId });
        return tasks.map(t => this._mapper.toDomain(t));
    }

    async findByChannel(channelId: string): Promise<AITask[]> {
        const tasks = await AITaskModel.find({ channel_id: channelId });
        return tasks.map(t => this._mapper.toDomain(t));
    }

    async findByAssigneeInWorkspace(userId: string, workspaceId: string): Promise<AITask[]> {
        const tasks = await AITaskModel.find({
            assigned_to: userId,
            workspace_id: workspaceId,
        }).sort({ due_date: 1 });
        return tasks.map((t) => this._mapper.toDomain(t));
    }

    async findForUserInWorkspace(userId: string, workspaceId: string): Promise<AITask[]> {
        const tasks = await AITaskModel.find({
            workspace_id: workspaceId,
            $or: [{ assigned_to: userId }, { created_by: userId }],
        }).sort({ created_at: -1 });
        return tasks.map((t) => this._mapper.toDomain(t));
    }

    async update(id: string, updateData: Partial<AITask>): Promise<AITask | null> {
        const updateDoc: any = {};
        if (updateData.title) updateDoc.title = updateData.title;
        if (updateData.description) updateDoc.description = updateData.description;
        if (updateData.status) updateDoc.status = updateData.status;
        if (updateData.assignedTo) updateDoc.assigned_to = updateData.assignedTo;
        if (updateData.dueDate) updateDoc.due_date = updateData.dueDate;

        const updatedTask = await AITaskModel.findByIdAndUpdate(id, updateDoc, { new: true });
        return updatedTask ? this._mapper.toDomain(updatedTask) : null;
    }

    async clearDoneForUserInWorkspace(userId: string, workspaceId: string): Promise<number> {
        const result = await AITaskModel.deleteMany({
            workspace_id: workspaceId,
            $or: [{ assigned_to: userId }, { created_by: userId }],
            status: { $in: [AITaskStatus.DONE, "completed"] },
        } as Record<string, unknown>);
        return result.deletedCount ?? 0;
    }
}
