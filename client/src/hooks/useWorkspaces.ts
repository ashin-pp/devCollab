import { useState, useEffect, useCallback } from 'react';
import { WorkspaceService } from '../api/workspace/workspace.service';
import type { WorkspaceData } from '../types/workspace.types';

export const useUserWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await WorkspaceService.getUserWorkspaces();
      setWorkspaces(response.data || []);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return { workspaces, loading, error, refetch: fetchWorkspaces };
};
