import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import { Channel } from "../../../domain/entities/channel.entity";
import { ChannelMember } from "../../../domain/entities/channel-member.entity";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { ChannelResponseDto } from "../../dtos/channel/response/channel.response.dto";
import { CreateChannelRequestDto } from "../../dtos/channel/request/create-channel-request.dto";


@injectable()
export class CreateChannelUseCase implements IBaseUseCase<CreateChannelRequestDto, ChannelResponseDto> {
    constructor(
        @inject(TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(payload: CreateChannelRequestDto): Promise<ChannelResponseDto> {
        const { workspaceId, name, description, createdBy, privacy } = payload;
        const newChannel = new Channel(
            workspaceId,
            name,
            description,
            createdBy,
            privacy,
            true
        );

        const createdChannel = await this._channelRepository.create(newChannel);

        const member = new ChannelMember(
            createdChannel.id as string,
            createdBy,
            createdBy,
            'admin',
            true
        );
        
        await this._channelMemberRepository.create(member);

        return {
            id: createdChannel.id as string,
            workspaceId: createdChannel.workspaceId,
            name: createdChannel.name,
            description: createdChannel.description,
            privacy: createdChannel.privacy,
            createdBy: createdChannel.createdBy,
            isActive: createdChannel.isActive,
            createdAt: createdChannel.createdAt as Date,
            updatedAt: createdChannel.updatedAt as Date
        };
    }
}
