import { Message } from "../../../domain/entities/message.entity";
import { IMessageDocument } from "../models/message.model";

export class MessageMapper {
    toDomain(raw: IMessageDocument): Message {
        return new Message(
            raw.workspace_id.toString(),
            raw.channel_id.toString(),
            raw.sender_id._id ? raw.sender_id._id.toString() : raw.sender_id.toString(),
            raw.content,
            raw.message_type,
            (raw.sender_id as unknown as { name?: string }).name,
            raw.image_url,
            raw.parent_message_id?.toString(),
            raw.thread_root_id?.toString(),
            raw.is_edited,
            raw.is_pinned,
            raw.seen_by.map((id: unknown) => String(id)),
            raw.expires_at,
            raw.created_at,
            raw.updated_at,
            raw._id.toString()
        );
    }
}
