
export interface IMarkMessageAsSeenUseCase {
    execute(conversationId: string, receiverId: string): Promise<void>;
}
