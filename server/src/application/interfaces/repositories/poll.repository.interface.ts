import { Poll } from "../../../domain/entities/poll.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface IPollRepository extends IBaseRepository<Poll> {
    findByWorkspace(workspaceId: string): Promise<Poll[]>;
    findByChannel(channelId: string): Promise<Poll[]>;
    findActiveByWorkspace(workspaceId: string): Promise<Poll[]>;
}
