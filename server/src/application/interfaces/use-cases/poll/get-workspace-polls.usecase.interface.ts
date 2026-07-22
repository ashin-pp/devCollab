import { Poll } from "../../../../domain/entities/poll.entity";

export interface IGetWorkspacePollsUseCase {
    execute(workspaceId: string): Promise<Poll[]>;
}
