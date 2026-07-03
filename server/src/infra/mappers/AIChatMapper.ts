import { AIChat } from "../../domain/entities/AIChat";
import { IMapper } from "../../application/interfaces/IMapper";
import { IAIChatModel } from "../database/models/AIChatModel";

export class AIChatMapper implements IMapper<AIChat, IAIChatModel> {
    toDomain(persistence: IAIChatModel): AIChat {
        return new AIChat(
            persistence.user_id.toString(),
            persistence.workspace_id.toString(),
            persistence.channel_id.toString(),
            persistence.command,
            persistence.prompt,
            persistence.response,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at
        );
    }

    toPersistence(domain: Partial<AIChat>): Partial<IAIChatModel> {
        const persistence: Partial<IAIChatModel> = {
            user_id: domain.userId as any,
            workspace_id: domain.workspaceId as any,
            channel_id: domain.channelId as any,
            command: domain.command,
            prompt: domain.prompt,
            response: domain.response
        };

        return Object.fromEntries(
            Object.entries(persistence).filter(([_, value]) => value !== undefined)
        ) as Partial<IAIChatModel>;
    }
}
