import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store';
import { fetchWorkspacePolls } from '../../store/slices/pollSlice';
import { PollCard } from './PollCard';
import { CreatePollModal } from './CreatePollModal';
import { Plus, Loader2, Vote, ArrowUpRight, Sparkles } from 'lucide-react';

interface WorkspacePollsListProps {
  workspaceId: string;
}

export const WorkspacePollsList: React.FC<WorkspacePollsListProps> = ({ workspaceId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { polls, loading } = useSelector((state: RootState) => state.polls);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspacePolls(workspaceId));
    }
  }, [dispatch, workspaceId]);

  const workspacePolls = polls.filter((p) => {
    if (p.channelId || !p.isActive) return false;
    if (p.expiresAt && new Date(p.expiresAt).getTime() <= now) return false;
    return true;
  });

  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(15,23,42,0.04)] h-[min(640px,calc(100vh-11rem))] max-h-[calc(100vh-8rem)]">
      {/* Soft accent wash */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-blue-50/90 via-indigo-50/40 to-transparent" />

      <div className="relative flex shrink-0 items-start justify-between gap-3 px-5 pt-5 pb-4">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-600/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
            <Sparkles className="h-3 w-3" />
            Live
          </div>
          <h3 className="text-lg font-extrabold tracking-tight text-slate-900">Team polls</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            {loading
              ? 'Loading…'
              : `${workspacePolls.length} active ${workspacePolls.length === 1 ? 'poll' : 'polls'} waiting for votes`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" />
          New poll
        </button>
      </div>

      <div className="relative min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 pb-3 custom-scrollbar">
        {loading ? (
          <div className="flex h-44 flex-col items-center justify-center gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
            <p className="text-xs font-medium text-slate-400">Fetching polls…</p>
          </div>
        ) : workspacePolls.length > 0 ? (
          workspacePolls.map((poll) => (
            <div key={poll.id} className="min-w-0">
              <PollCard poll={poll} compact />
            </div>
          ))
        ) : (
          <div className="mx-1 flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
              <Vote className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm font-bold text-slate-700">No active polls yet</p>
            <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-slate-400">
              Start a quick poll and get instant feedback from your workspace.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Create your first poll
            </button>
          </div>
        )}
      </div>

      {workspacePolls.length > 0 && (
        <div className="relative shrink-0 border-t border-slate-100/80 bg-slate-50/50 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${workspaceId}/polls`)}
            className="group flex w-full items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-left text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-blue-200 hover:text-blue-700"
          >
            <span>Browse all polls</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-blue-600" />
          </button>
        </div>
      )}

      <CreatePollModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
};
