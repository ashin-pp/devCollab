
export interface ICreateAIReminderUseCase {
    execute(data: { userId: string; workspaceId: string; channelId: string; content: string; remindAt: string; senderId?: string }): Promise<void>;
}
