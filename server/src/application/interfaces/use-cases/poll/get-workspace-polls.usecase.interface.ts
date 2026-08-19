import { PollResponseDto } from "../../../dtos/poll/response/poll.response.dto";

export interface IGetWorkspacePollsUseCase {
    execute(workspaceId: string): Promise<PollResponseDto[]>;
}
