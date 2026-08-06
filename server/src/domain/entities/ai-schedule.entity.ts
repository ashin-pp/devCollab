export type AIScheduleStatus = "scheduled" | "cancelled" | "completed";

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
        public googleEventId?: string,
        public reminderSent: boolean = false,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}
}
