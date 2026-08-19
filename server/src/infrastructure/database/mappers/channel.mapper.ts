import { Channel } from "../../../domain/entities/channel.entity";
import { IChannelDocument } from "../models/channel.model";

export class ChannelMapper {
    toDomain(raw: IChannelDocument): Channel {
        return new Channel(
            raw.workspace_id.toString(),
            raw.name,
            raw.description,
            raw.created_by.toString(),
            raw.privacy,
            raw.is_active,
            raw.created_at,
            raw.updated_at,
            raw._id.toString()
        );
    }
}
