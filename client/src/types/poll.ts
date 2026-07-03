export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // User IDs who voted
}

export interface Poll {
  id: string;
  workspaceId: string;
  channelId?: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  isActive: boolean;
  expiresAt?: string;
  startsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePollData {
  workspaceId: string;
  channelId?: string;
  question: string;
  options: string[];
  expiresAt?: string;
  startsAt?: string;
}
