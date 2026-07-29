import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import { ChannelMember } from "../../../domain/entities/channel-member.entity";
import { Channel } from "../../../domain/entities/channel.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { CreateChannelRequestDto } from "../../dtos/channel/request/create-channel-request.dto";
import { ChannelResponseDto } from "../../dtos/channel/response/channel.response.dto";
import { ICreateChannelUseCase } from "../../interfaces/use-cases/channel/create-channel.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { isValidChannelName, normalizeChannelName } from "../../../shared/utils/name-validation.util";

@injectable()
export class CreateChannelUseCase implements ICreateChannelUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(payload: CreateChannelRequestDto): Promise<ChannelResponseDto> {
        const { workspaceId, description, createdBy, privacy } = payload;
        const name = normalizeChannelName(payload.name ?? '');

        if (!name) {
            throw new AppError(ErrorMessage.CHANNEL_NAME_EMPTY, HttpStatusCode.BAD_REQUEST);
        }

        if (!isValidChannelName(name)) {
            throw new AppError(ErrorMessage.CHANNEL_NAME_INVALID, HttpStatusCode.BAD_REQUEST);
        }

        if (!workspaceId || !createdBy) {
            throw new AppError(ErrorMessage.INVALID_CHANNEL_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const existing = await this._channelRepository.findByWorkspaceAndName(workspaceId, name);
        if (existing) {
            throw new AppError(ErrorMessage.CHANNEL_NAME_EXISTS, HttpStatusCode.CONFLICT);
        }

        const newChannel = new Channel(
            workspaceId,
            name,
            description?.trim() ?? '',
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
