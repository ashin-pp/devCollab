import { Poll } from "../../domain/entities/Poll";
import { IBaseRepository } from "./IBaseRepository";

export interface IPollRepository extends IBaseRepository<Poll> {
    findByWorkspace(workspaceId: string): Promise<Poll[]>;
    findByChannel(channelId: string): Promise<Poll[]>;
    findActiveByWorkspace(workspaceId: string): Promise<Poll[]>;
}
