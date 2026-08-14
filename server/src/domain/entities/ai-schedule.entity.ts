export type AIScheduleStatus = "scheduled" | "cancelled" | "completed";

export type AIScheduleVideoProvider = "webrtc" | "none";

export class AISchedule {
    constructor(
        public organizerId: string,
        public participantId: string,
        public workspaceId: string,
        public channelId: string,
        public title: string,
        public startsAt: Date,
        public endsAt: Date,
        public status: AIScheduleStatus = "scheduled",
        public meetLink?: string,
        public reminderSent: boolean = false,
        public participantIds: string[] = [],
        public videoProvider: AIScheduleVideoProvider = "none",
        public roomName?: string,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}
}
