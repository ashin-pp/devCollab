import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const DMListPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (workspaceId) {
      navigate(`/workspace/${workspaceId}/dm`, { replace: true });
    }
  }, [workspaceId, navigate]);

  return null;
};
