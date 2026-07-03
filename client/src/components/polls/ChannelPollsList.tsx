import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchChannelPolls } from '../../store/slices/pollSlice';
import { PollCard } from './PollCard';
import { CreatePollModal } from './CreatePollModal';
import { BarChart2, Plus } from 'lucide-react';

interface ChannelPollsListProps {
  workspaceId: string;
  channelId: string;
}

export const ChannelPollsList: React.FC<ChannelPollsListProps> = ({ workspaceId, channelId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { polls } = useSelector((state: RootState) => state.polls);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000); // Check for expired polls every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (channelId) {
      dispatch(fetchChannelPolls(channelId));
    }
  }, [dispatch, channelId]);

  const channelPolls = polls.filter(p => {
    if (p.channelId !== channelId || !p.isActive) return false;
    if (p.expiresAt && new Date(p.expiresAt).getTime() <= now) return false;
    return true;
  });

  if (channelPolls.length === 0 && !isExpanded) {
    return (
      <>
        <div className="px-6 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">No active polls in this channel.</span>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Plus className="w-3 h-3" /> Create Poll
          </button>
        </div>
        <CreatePollModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          workspaceId={workspaceId}
          channelId={channelId} 
        />
      </>
    );
  }

  return (
    <div className="bg-slate-50 border-b border-slate-200">
      <div 
        className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
             <BarChart2 className="w-4 h-4" />
          </div>
          <span className="text-[13px] font-bold text-slate-700 tracking-wide uppercase">
            Active Polls ({channelPolls.length})
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
            className="flex items-center gap-1 text-[13px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
          >
            <Plus className="w-4 h-4" /> Create Poll
          </button>
          <span className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">
            {isExpanded ? 'Hide' : 'Show'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-5 flex gap-5 overflow-x-auto hide-scrollbar bg-slate-50/80 inner-shadow-sm">
          {channelPolls.map(poll => (
            <div key={poll.id} className="min-w-[320px] max-w-[320px] shrink-0 animate-in slide-in-from-top-2 fade-in duration-200">
              <PollCard poll={poll} compact />
            </div>
          ))}
          {channelPolls.length === 0 && (
             <div className="text-sm font-medium text-slate-500 w-full text-center py-6 bg-white rounded-xl border border-dashed border-slate-300">
                No active polls found. Be the first to ask!
             </div>
          )}
        </div>
      )}

      <CreatePollModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        workspaceId={workspaceId}
        channelId={channelId} 
      />
    </div>
  );
};
