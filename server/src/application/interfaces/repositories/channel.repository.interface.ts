import { Channel } from "../../../domain/entities/channel.entity";

export interface IChannelRepository {
    create(channel: Channel): Promise<Channel>;
    findById(id: string): Promise<Channel | null>;
    findByWorkspaceId(workspaceId: string): Promise<Channel[]>;
    findByWorkspaceAndName(workspaceId: string, name: string): Promise<Channel | null>;
    update(id: string, channel: Partial<Channel>): Promise<Channel | null>;
    delete(id: string): Promise<boolean>;
}
