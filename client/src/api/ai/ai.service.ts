import { api } from '../axios';
import { API_ENDPOINTS } from '../../config/api.constants';
import type { AIDashboardResponse, IAIRequest, IAIResponse } from '../../types/ai.types';

export const AiService = {
    processCommand: (data: IAIRequest) => {
        return api.post<IAIResponse>(API_ENDPOINTS.AI.PROCESS, data);
    },
    getDashboard: (workspaceId: string) => {
        return api.get<AIDashboardResponse>(API_ENDPOINTS.AI.DASHBOARD, {
            params: { workspaceId },
        });
    },
    updateTaskStatus: (taskId: string, workspaceId: string, status: string = 'done') => {
        return api.patch(API_ENDPOINTS.AI.TASK_STATUS(taskId), { workspaceId, status });
    },
    clearDashboardTab: (workspaceId: string, tab: 'tasks' | 'reminders' | 'notifications' | 'schedule') => {
        return api.post(API_ENDPOINTS.AI.DASHBOARD_CLEAR, { workspaceId, tab });
    },
};
