export interface GetAIDashboardDTO {
    userId: string;
    workspaceId: string;
}

export interface AIDashboardPerson {
    id?: string;
    name: string;
    /** Short relationship word shown in UI: From / For / With */
    label: "From" | "For" | "With";
}

export interface AIDashboardTaskItem {
    id?: string;
    title: string;
    description: string;
    status: string;
    dueDate?: Date;
    assignedTo: string;
    createdBy: string;
    channelId: string;
    person: AIDashboardPerson;
}

export interface AIDashboardReminderItem {
    id?: string;
    content: string;
    remindAt: Date;
    isSent: boolean;
    channelId: string;
    userId: string;
    senderId?: string;
    person: AIDashboardPerson;
}

export interface AIDashboardScheduleItem {
    id?: string;
    title: string;
    startsAt: Date;
    endsAt: Date;
    meetLink?: string;
    status: string;
    organizerId: string;
    participantId: string;
    channelId: string;
    person: AIDashboardPerson;
}

export interface AIDashboardNotificationItem {
    id?: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt?: Date;
    actorId?: string;
    person: AIDashboardPerson;
}

export interface AIDashboardCounts {
    tasks: number;
    reminders: number;
    schedules: number;
    notifications: number;
}

export interface AIDashboardResult {
    tasks: AIDashboardTaskItem[];
    reminders: AIDashboardReminderItem[];
    schedules: AIDashboardScheduleItem[];
    notifications: AIDashboardNotificationItem[];
    counts: AIDashboardCounts;
}

export interface IGetAIDashboardUseCase {
    execute(dto: GetAIDashboardDTO): Promise<AIDashboardResult>;
}
