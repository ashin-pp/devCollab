import { ChannelMember } from "../../domain/entities/ChannelMember";
import { IChannelMemberDocument } from "../database/models/ChannelMemberModel";

export class ChannelMemberMapper {
    toDomain(raw: IChannelMemberDocument): ChannelMember {
        return new ChannelMember(
            raw.channel_id.toString(),
            raw.user_id.toString(),
            raw.added_by.toString(),
            raw.role,
            raw.is_active,
            raw.status,
            raw.joined_at,
            raw.removed_at,
            raw.last_read_at,
            raw._id.toString()
        );
    }
}
