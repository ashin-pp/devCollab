import { Channel } from "../entities/Channel";

export interface IChannelRepository {
    create(channel: Channel): Promise<Channel>;
    findById(id: string): Promise<Channel | null>;
    findByWorkspaceId(workspaceId: string): Promise<Channel[]>;
    update(id: string, channel: Partial<Channel>): Promise<Channel | null>;
    delete(id: string): Promise<boolean>;
}
