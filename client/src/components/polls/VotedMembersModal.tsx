import React, { useState, useEffect } from 'react';
import type { Poll } from '../../types/poll';
import { WorkspaceService } from '../../api/workspace/workspace.service';

interface VotedMembersModalProps {
  poll: Poll;
  onClose: () => void;
}

export const VotedMembersModal: React.FC<VotedMembersModalProps> = ({ poll, onClose }) => {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (poll.workspaceId) {
      WorkspaceService.getWorkspaceMembers(poll.workspaceId, false)
        .then(res => setMembers(Array.isArray(res.data) ? res.data : res.data?.data || []))
        .catch(err => console.error('Failed to fetch members', err));
    }
  }, [poll.workspaceId]);
  
  const getUserDetails = (userId: string) => {
    return members.find(m => m.userId === userId)?.user || null;
  };

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ zIndex: 100 }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] relative border border-slate-200/50">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between relative z-10 bg-white/80 backdrop-blur-sm">
          <div>
            <h2 className="font-extrabold text-xl text-slate-900 tracking-tight">Poll Results</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Detailed breakdown of votes</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-full transition-colors border border-slate-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar relative z-10 space-y-6">
          {poll.options.map(option => {
            const percentage = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;
            return (
              <div key={option.id} className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-end mb-3">
                  <div className="font-bold text-sm text-slate-900">{option.text}</div>
                  <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {option.votes.length} {option.votes.length === 1 ? 'vote' : 'votes'} ({percentage}%)
                  </div>
                </div>
                
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>

                {option.votes.length === 0 ? (
                  <div className="text-xs text-slate-400 italic font-medium px-1">No one voted for this option</div>
                ) : (
                  <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-200/60">
                    {option.votes.map(vId => {
                      const vUser = getUserDetails(vId);
                      return (
                        <div key={vId} className="flex items-center gap-3">
                          {vUser?.profileImage ? (
                            <img src={vUser.profileImage} alt={vUser.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-white" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600 border border-slate-200">
                              {vUser?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <span className="text-sm font-semibold text-slate-800">{vUser?.name || 'Unknown User'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
