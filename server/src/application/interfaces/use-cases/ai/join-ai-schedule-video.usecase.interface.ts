export interface JoinAIScheduleVideoDTO {
    scheduleId: string;
    userId: string;
}

export interface JoinAIScheduleVideoMember {
    userId: string;
    name: string;
    profileImage?: string;
    role: "organizer" | "invitee";
}

export interface JoinAIScheduleVideoResult {
    provider: "webrtc";
    title: string;
    scheduleId: string;
    roomName: string;
    organizerId: string;
    organizerName: string;
    members: JoinAIScheduleVideoMember[];
}

export interface IJoinAIScheduleVideoUseCase {
    execute(dto: JoinAIScheduleVideoDTO): Promise<JoinAIScheduleVideoResult>;
}
