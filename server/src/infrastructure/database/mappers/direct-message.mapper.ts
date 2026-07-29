import { DirectMessage } from "../../../domain/entities/direct-message.entity";
import { IDirectMessageDocument } from "../models/direct-message.model";
import { MessageType } from "../../../domain/enums/MessageType";

export class DirectMessageMapper {
    toDomain(raw: IDirectMessageDocument): DirectMessage {
        return new DirectMessage(
            raw.conversationId.toString(),
            raw.senderId.toString(),
            raw.content,
            raw.isSeen,
            raw.messageType as MessageType,
            raw.imageUrl,
            raw.isEdited,
            raw.createdAt,
            raw.updatedAt,
            raw._id ? raw._id.toString() : undefined
        );
    }
}
