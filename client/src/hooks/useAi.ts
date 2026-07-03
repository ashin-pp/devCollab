import { useState, useCallback } from 'react';
import { AiService } from '../api/ai/ai.service';

export const useAiCommand = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const processCommand = useCallback(async (input: string, workspaceId: string, channelId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await AiService.processCommand({ input, workspaceId, channelId });
            return res.data?.data?.response;
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } } };
            const errorMessage = errorObj.response?.data?.message || 'Failed to process AI command';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        processCommand,
        isLoading,
        error
    };
};
