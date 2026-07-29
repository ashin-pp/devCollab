
export interface ICreateAITaskUseCase {
    execute(data: { workspaceId: string; channelId: string; title: string; description: string; assignedTo: string; dueDate: string }): Promise<void>;
}
