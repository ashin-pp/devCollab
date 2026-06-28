import { api } from '../axios';
import type { Poll, CreatePollData } from '../../types/poll';
import { API_ENDPOINTS } from '../../config/api.constants';

export const pollApi = {
  create: async (data: CreatePollData): Promise<Poll> => {
    const response = await api.post(API_ENDPOINTS.POLLS.CREATE, data);
    return response.data.data;
  },

  vote: async (pollId: string, optionId: string): Promise<Poll> => {
    const response = await api.post(API_ENDPOINTS.POLLS.VOTE(pollId), { optionId });
    return response.data.data;
  },

  getWorkspacePolls: async (workspaceId: string): Promise<Poll[]> => {
    const response = await api.get(API_ENDPOINTS.POLLS.WORKSPACE(workspaceId));
    return response.data.data;
  },

  getChannelPolls: async (channelId: string): Promise<Poll[]> => {
    const response = await api.get(API_ENDPOINTS.POLLS.CHANNEL(channelId));
    return response.data.data;
  },

  delete: async (pollId: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.POLLS.CREATE}/${pollId}`);
  },

  close: async (pollId: string): Promise<Poll> => {
    const response = await api.patch(`${API_ENDPOINTS.POLLS.CREATE}/${pollId}/close`);
    return response.data.data;
  }
};
