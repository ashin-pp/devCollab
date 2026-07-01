import { api } from '../axios';
import { API_ENDPOINTS } from '../../config/api.constants';
import type { IAIRequest, IAIResponse } from '../../types/ai.types';

export const AiService = {
    processCommand: (data: IAIRequest) => {
        return api.post<IAIResponse>(API_ENDPOINTS.AI.PROCESS, data);
    }
};
