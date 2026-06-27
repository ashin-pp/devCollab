import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchWorkspacePolls } from '../../store/slices/pollSlice';
import { PollCard } from './PollCard';
import { CreatePollModal } from './CreatePollModal';
import { PlusCircle, Loader2 } from 'lucide-react';

interface WorkspacePollsListProps {
  workspaceId: string;
}

export const WorkspacePollsList: React.FC<WorkspacePollsListProps> = ({ workspaceId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { polls, loading } = useSelector((state: RootState) => state.polls);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000); // Check for expired polls every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspacePolls(workspaceId));
    }
  }, [dispatch, workspaceId]);

  const workspacePolls = polls.filter(p => {
    if (p.channelId || !p.isActive) return false;
    if (p.expiresAt && new Date(p.expiresAt).getTime() <= now) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-lg">Workspace Polls</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Poll
        </button>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : workspacePolls.length > 0 ? (
          workspacePolls.map(poll => (
            <PollCard key={poll.id} poll={poll} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <PlusCircle className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No polls active in this workspace.</p>
            <p className="text-xs text-slate-400 mt-1">Create one to engage with your team!</p>
          </div>
        )}
      </div>

      <CreatePollModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        workspaceId={workspaceId} 
      />
    </div>
  );
};
