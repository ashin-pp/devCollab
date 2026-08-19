import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { WorkspaceService } from '../api/workspace/workspace.service';
import type { WorkspaceData } from '../types/workspace.types';
import { isSubscriptionExpiredError } from '../utils/subscription.utils';

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
      if (isSubscriptionExpiredError(err)) {
        toast.error('Your subscription has expired. Paid features are locked until you renew.');
        setWorkspaces([]);
        setError(null);
        return;
      }
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
