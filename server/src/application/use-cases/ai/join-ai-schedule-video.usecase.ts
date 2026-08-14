import { inject, injectable } from "tsyringe";
import type { IAIScheduleRepository } from "../../interfaces/repositories/ai-schedule.repository.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type {
    IJoinAIScheduleVideoUseCase,
    JoinAIScheduleVideoDTO,
    JoinAIScheduleVideoMember,
    JoinAIScheduleVideoResult,
} from "../../interfaces/use-cases/ai/join-ai-schedule-video.usecase.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

const NATIVE_PROVIDERS = new Set(["webrtc"]);

@injectable()
export class JoinAIScheduleVideoUseCase implements IJoinAIScheduleVideoUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAIScheduleRepository)
        private readonly _aiScheduleRepository: IAIScheduleRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository)
        private readonly _userRepository: IUserRepository
    ) {}

    async execute(dto: JoinAIScheduleVideoDTO): Promise<JoinAIScheduleVideoResult> {
        const schedule = await this._aiScheduleRepository.findById(dto.scheduleId);
        if (!schedule) {
            throw new AppError(ErrorMessage.SCHEDULE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const inviteeIds = Array.from(
            new Set(
                [
                    schedule.organizerId,
                    schedule.participantId,
                    ...(schedule.participantIds ?? []),
                ].filter(Boolean)
            )
        );

        if (!inviteeIds.includes(dto.userId)) {
            throw new AppError(ErrorMessage.VIDEO_JOIN_FORBIDDEN, HttpStatusCode.FORBIDDEN);
        }

        const hasNativeRoom =
            NATIVE_PROVIDERS.has(schedule.videoProvider) ||
            Boolean(schedule.meetLink?.includes("/call/"));

        if (!hasNativeRoom) {
            throw new AppError(
                ErrorMessage.VIDEO_ROOM_UNAVAILABLE,
                HttpStatusCode.BAD_REQUEST
            );
        }

        const users = await this._userRepository.findByIds(inviteeIds);
        const byId = new Map(users.map((u) => [u.id as string, u]));

        const members: JoinAIScheduleVideoMember[] = inviteeIds.map((userId) => {
            const user = byId.get(userId);
            return {
                userId,
                name: user?.name ?? "Member",
                profileImage: user?.profileImage,
                role: userId === schedule.organizerId ? "organizer" : "invitee",
            };
        });

        const organizer = byId.get(schedule.organizerId);

        return {
            provider: "webrtc",
            title: schedule.title,
            scheduleId: schedule.id as string,
            roomName: schedule.roomName || `dc-${schedule.id}`,
            organizerId: schedule.organizerId,
            organizerName: organizer?.name ?? "Organizer",
            members,
        };
    }
}
