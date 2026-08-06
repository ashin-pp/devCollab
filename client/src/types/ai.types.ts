export interface IAIRequest {
  input: string;
  workspaceId: string;
  channelId: string;
}

export interface IAIResponse {
  success: boolean;
  data: {
    response: string;
  };
}

export interface AIDashboardPerson {
  id?: string;
  name: string;
  label: 'From' | 'For' | 'With';
}

export interface AIDashboardTask {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  assignedTo: string;
  createdBy?: string;
  channelId: string;
  person?: AIDashboardPerson;
}

export interface AIDashboardReminder {
  id: string;
  content: string;
  remindAt: string;
  isSent: boolean;
  channelId: string;
  person?: AIDashboardPerson;
}

export interface AIDashboardSchedule {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  meetLink?: string;
  status: string;
  organizerId: string;
  participantId: string;
  channelId: string;
  person?: AIDashboardPerson;
}

export interface AIDashboardNotification {
  id?: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string | Date;
  person?: AIDashboardPerson;
}

export interface AIDashboardCounts {
  tasks: number;
  reminders: number;
  schedules: number;
  notifications: number;
}

export interface AIDashboardData {
  tasks: AIDashboardTask[];
  reminders: AIDashboardReminder[];
  schedules: AIDashboardSchedule[];
  notifications: AIDashboardNotification[];
  counts: AIDashboardCounts;
}

export interface AIDashboardResponse {
  success: boolean;
  data: AIDashboardData;
}
