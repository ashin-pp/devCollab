import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import { ChannelMember } from "../../../domain/entities/channel-member.entity";
import { Channel } from "../../../domain/entities/channel.entity";
import { CreateChannelRequestDto } from "../../dtos/channel/request/create-channel-request.dto";
import { ChannelResponseDto } from "../../dtos/channel/response/channel.response.dto";
import { ICreateChannelUseCase } from "../../interfaces/use-cases/channel/create-channel.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class CreateChannelUseCase implements ICreateChannelUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository
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
