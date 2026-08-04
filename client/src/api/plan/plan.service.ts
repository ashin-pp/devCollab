import { api } from '../axios';
import { API_ENDPOINTS } from '../../config/api.constants';

export type Plan = {
    id: string;
    name: string;
    price: number;
    currency: string;
    durationDays: number;
    maxWorkspaces: number;
    maxMembersPerWorkspace: number;
    messageRetentionDays: number;
    aiAssistantEnabled: boolean;
    videoCallsEnabled: boolean;
    multiAiAgents: boolean;
    pinBoardEnabled: boolean;
    isActive: boolean;
};

export const PlanService = {
    getActivePlans: async (): Promise<Plan[]> => {
        const response = await api.get(API_ENDPOINTS.PLANS.BASE);
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    },
};
