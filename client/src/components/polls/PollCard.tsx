import React from 'react';
import type { Poll } from '../../types/poll';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { votePoll, deletePollThunk } from '../../store/slices/pollSlice';
import { BarChart2, CheckCircle2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface PollCardProps {
  poll: Poll;
  compact?: boolean; // For simple channel chat view
}

export const PollCard: React.FC<PollCardProps> = ({ poll, compact = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;

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
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {poll.question}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                {poll.expiresAt && ` • Expires: ${new Date(poll.expiresAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`}
              </span>
            </div>
          </div>
          {poll.createdBy === userId && (
             <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Poll">
               <Trash2 className="w-4 h-4" />
             </button>
          )}
        </div>
        
        <div className="space-y-2">
          {poll.options.map((option) => {
            const votesCount = option.votes.length;
            const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
            const isSelected = userVotedOption?.id === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                className={`relative w-full overflow-hidden text-left rounded-lg border transition-all duration-200 ${
                  isSelected 
                    ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {/* Progress Bar Background */}
                {(hasVoted || !poll.isActive) && (
                  <div 
                    className={`absolute inset-0 opacity-10 ${isSelected ? 'bg-indigo-600' : 'bg-gray-400'}`}
                    style={{ width: `${percentage}%` }}
                  />
                )}
                
                <div className="relative flex items-center justify-between p-2.5 z-10">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option.text}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  
                  {(hasVoted || !poll.isActive) && (
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        {!poll.isActive && (
          <p className="mt-3 text-xs font-medium text-red-500 text-center">
            Poll closed
          </p>
        )}
      </div>
    );
  }

  // Full detailed view (Workspace level)
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
    </div>
  );
};
