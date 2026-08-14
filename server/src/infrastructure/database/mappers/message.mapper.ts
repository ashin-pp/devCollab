import { Message } from "../../../domain/entities/message.entity";
import { IMessageDocument } from "../models/message.model";

export class MessageMapper {
    toDomain(raw: IMessageDocument): Message {
        const sender = raw.sender_id as unknown as { _id?: { toString(): string }; name?: string } | string | null;
        if (sender == null) {
            throw new Error("Message has missing sender");
        }

        const senderId =
            typeof sender === "object" && sender._id
                ? sender._id.toString()
                : String(sender);
        const senderName =
            typeof sender === "object" ? sender.name : undefined;

        return new Message(
            raw.workspace_id.toString(),
            raw.channel_id.toString(),
            senderId,
            raw.content,
            raw.message_type,
            senderName,
            raw.image_url,
            raw.parent_message_id?.toString(),
            raw.thread_root_id?.toString(),
            raw.reply_visibility,
            raw.visible_to_user_id?.toString(),
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
