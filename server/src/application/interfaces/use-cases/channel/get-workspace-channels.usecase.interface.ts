import { ChannelResponseDto } from "../../../dtos/channel/response/channel.response.dto";

export interface IGetWorkspaceChannelsUseCase {
    execute(payload: {workspaceId: string, userId: string}): Promise<ChannelResponseDto[]>;
}
