import { useState, useCallback } from 'react';
import { isAxiosError } from 'axios';
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
            let errorMessage = 'Failed to process AI command';
            if (isAxiosError(err)) {
                errorMessage =
                    err.response?.data?.error?.message ||
                    err.response?.data?.message ||
                    errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
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
