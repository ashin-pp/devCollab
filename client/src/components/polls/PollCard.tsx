import React, { useState } from 'react';
import { VotedMembersModal } from './VotedMembersModal';
import type { Poll } from '../../types/poll';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { votePoll, deletePollThunk } from '../../store/slices/pollSlice';
import { BarChart2, Check, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface PollCardProps {
  poll: Poll;
  compact?: boolean;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, compact = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  const [showVotersModal, setShowVotersModal] = useState(false);

  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes.length, 0);
  const userVotedOption = poll.options.find(opt => opt.votes.includes(userId || ''));
  const hasVoted = !!userVotedOption;

  const handleVote = async (optionId: string) => {
    if (!poll.isActive) {
      toast.error('This poll is closed');
      return;
    }
    if (!userId) {
      toast.error('You must be logged in to vote');
      return;
    }

    try {
      await dispatch(votePoll({ pollId: poll.id, optionId })).unwrap();
      toast.success('Vote recorded!');
    } catch (error: unknown) {
      const err = error as string | { message?: string };
      toast.error(typeof err === 'string' ? err : (err.message || 'Failed to vote'));
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Delete Poll?',
      text: "Are you sure you want to delete this poll? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it'
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(deletePollThunk(poll.id)).unwrap();
      toast.success('Poll deleted');
    } catch(error: unknown) {
      const err = error as string | { message?: string };
      toast.error(typeof err === 'string' ? err : (err.message || 'Failed to delete poll'));
    }
  };

  if (compact) {
    return (
      <article className="group w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md">
        <div className="mb-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                Active
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                <Users className="h-2.5 w-2.5" />
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
              </span>
            </div>
            <h4 className="line-clamp-2 text-[13px] font-bold leading-snug text-slate-900">
              {poll.question}
            </h4>
            {poll.expiresAt && (
              <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
                Ends {new Date(poll.expiresAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            )}
          </div>
          {poll.createdBy === userId && (
            <button
              onClick={handleDelete}
              className="shrink-0 rounded-lg p-1.5 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
              title="Delete poll"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {poll.options.map((option) => {
            const votesCount = option.votes.length;
            const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
            const isSelected = userVotedOption?.id === option.id;
            const showResults = hasVoted || !poll.isActive;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleVote(option.id)}
                disabled={!poll.isActive}
                className={`relative w-full overflow-hidden rounded-xl border text-left transition-all duration-200 disabled:cursor-default ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/30'
                    : 'border-slate-200 bg-slate-50/80 hover:border-blue-200 hover:bg-white'
                }`}
              >
                {showResults && (
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                      isSelected ? 'bg-blue-500/15' : 'bg-slate-900/[0.05]'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                    </span>
                    <span
                      className={`truncate text-xs font-semibold ${
                        isSelected ? 'text-blue-800' : 'text-slate-700'
                      }`}
                    >
                      {option.text}
                    </span>
                  </div>

                  {showResults && (
                    <span
                      className={`shrink-0 tabular-nums text-[11px] font-bold ${
                        isSelected ? 'text-blue-700' : 'text-slate-500'
                      }`}
                    >
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {!poll.isActive && (
          <p className="mt-3 text-center text-[11px] font-semibold text-rose-500">Poll closed</p>
        )}

        {totalVotes > 0 && (
          <div className="mt-3 border-t border-slate-100 pt-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowVotersModal(true);
              }}
              className="w-full text-center text-[11px] font-bold text-blue-600 transition hover:text-blue-700"
            >
              See who voted
            </button>
          </div>
        )}

        {showVotersModal && (
          <VotedMembersModal poll={poll} onClose={() => setShowVotersModal(false)} />
        )}
      </article>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{poll.question}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} • {poll.isActive ? 'Active' : 'Closed'}
            {poll.expiresAt && ` • Expires: ${new Date(poll.expiresAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`}
          </p>
        </div>
        {poll.createdBy === userId && (
           <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 flex items-center gap-2">
             <Trash2 className="w-5 h-5" />
             <span className="text-sm font-medium">Delete</span>
           </button>
        )}
      </div>

      <div className="space-y-3">
        {poll.options.map((option) => {
          const votesCount = option.votes.length;
          const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
          const isSelected = userVotedOption?.id === option.id;

          return (
            <div key={option.id} className="relative group">
              <button
                onClick={() => handleVote(option.id)}
                disabled={!poll.isActive}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' 
                    : 'border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700'
                }`}
              >
                {/* Beautiful animated progress bar */}
                {(hasVoted || !poll.isActive) && (
                  <div 
                    className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out ${
                      isSelected 
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20' 
                        : 'bg-gray-200/50 dark:bg-gray-600/50'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-500' 
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className={`font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-200'}`}>
                      {option.text}
                    </span>
                  </div>

                  {(hasVoted || !poll.isActive) && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {votesCount} votes
                      </span>
                      <span className={`text-sm font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {totalVotes > 0 && (
        <div className="mt-6 flex justify-end">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowVotersModal(true); }}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg"
          >
            View Voted Members
          </button>
        </div>
      )}

      {showVotersModal && (
        <VotedMembersModal 
          poll={poll} 
          onClose={() => setShowVotersModal(false)} 
        />
      )}
    </div>
  );
};
