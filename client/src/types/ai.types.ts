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
  label: 'From' | 'For' | 'With' | 'Created by';
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
  videoProvider?: string;
  roomName?: string;
  status: string;
  organizerId: string;
  participantId: string;
  participantIds?: string[];
  channelId: string;
  person?: AIDashboardPerson;
  organizer?: AIDashboardPerson;
}

export interface VideoCallMember {
  userId: string;
  name: string;
  profileImage?: string;
  role: 'organizer' | 'invitee';
}

export interface VideoJoinCredentials {
  provider: 'webrtc';
  title: string;
  scheduleId: string;
  roomName: string;
  organizerId: string;
  organizerName: string;
  members: VideoCallMember[];
}

export interface VideoJoinResponse {
  success: boolean;
  data: VideoJoinCredentials;
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
