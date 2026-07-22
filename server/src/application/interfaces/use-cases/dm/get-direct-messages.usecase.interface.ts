import { DirectMessage } from "../../../../domain/entities/direct-message.entity";

export interface IGetDirectMessagesUseCase {
    execute(conversationId: string, userId: string, limit: number, skip: number): Promise<DirectMessage[]>;
}
