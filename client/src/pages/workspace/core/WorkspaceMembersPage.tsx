import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceService } from '../../../api/workspace/workspace.service';
import { WorkspaceLayout } from '../../../layouts/WorkspaceLayout';
import { Users, UserCheck, UserX, Clock, Loader2, Search, UserPlus } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/index';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import type { MemberData } from '../../../types/workspace.types';
import { InviteMemberModal } from '../../../components/workspace/InviteMemberModal';

export const WorkspaceMembersPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchMembers();
  }, [workspaceId]);

  async function fetchMembers() {
    if (!workspaceId) return;
    try {
      setIsLoading(true);
      const data = await WorkspaceService.getWorkspaceMembers(workspaceId, false);
      setMembers(Array.isArray(data.data) ? data.data : data.data?.data || []);
    } catch {
      toast.error('Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async (targetUserId: string, action: 'approve' | 'reject') => {
    if (!workspaceId) return;
    try {
      const confirmText = action === 'approve' ? 'Approve this request?' : 'Reject this request?';
      const result = await Swal.fire({
        title: confirmText,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: action === 'approve' ? '#10b981' : '#ef4444',
        confirmButtonText: action === 'approve' ? 'Approve' : 'Reject'
      });

      if (result.isConfirmed) {
        await WorkspaceService.handleJoinRequest(workspaceId, targetUserId, action);
        toast.success(`Request ${action}d successfully`);
        fetchMembers(); // Refresh list
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!workspaceId) return;
    try {
      const result = await Swal.fire({
        title: 'Remove Member?',
        text: "This user will be removed from the workspace but can rejoin later with an invite.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Yes, Remove'
      });

      if (result.isConfirmed) {
        await WorkspaceService.removeMember(workspaceId, targetUserId);
        toast.success('Member removed successfully');
        fetchMembers();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleBlockMember = async (targetUserId: string, action: 'block' | 'unblock') => {
    if (!workspaceId) return;
    try {
      const isBlocking = action === 'block';
      const result = await Swal.fire({
        title: isBlocking ? 'Block Member?' : 'Unblock Member?',
        text: isBlocking ? "This user will be permanently blocked from rejoining this workspace." : "This user will be unblocked and able to participate again.",
        icon: isBlocking ? 'error' : 'question',
        showCancelButton: true,
        confirmButtonColor: isBlocking ? '#000000' : '#10b981',
        confirmButtonText: isBlocking ? 'Yes, Block' : 'Yes, Unblock'
      });

      if (result.isConfirmed) {
        if (isBlocking) {
          await WorkspaceService.blockMember(workspaceId, targetUserId);
        } else {
          await WorkspaceService.unblockMember(workspaceId, targetUserId);
        }
        toast.success(isBlocking ? 'Member blocked successfully' : 'Member unblocked successfully');
        fetchMembers();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || `Failed to ${action} member`);
    }
  };

  const isOwner = members.some(m => m.userId === currentUser?.id && m.role === 'owner');

  const approvedMembers = members.filter(m => m.status === 'approved' || m.status === 'blocked');
  const pendingMembers = members.filter(m => m.status === 'pending');

  // Filter members based on search query
  const filteredApprovedMembers = approvedMembers.filter(member => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.user?.name?.toLowerCase().includes(query) ||
      member.user?.email?.toLowerCase().includes(query)
    );
  });

  const filteredPendingMembers = pendingMembers.filter(member => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.user?.name?.toLowerCase().includes(query) ||
      member.user?.email?.toLowerCase().includes(query)
    );
  });

  const handleViewProfile = (member: MemberData) => {
    navigate(`/workspace/${workspaceId}/members/${member.userId}/profile`);
  };

  if (isLoading) {
    return (
      <WorkspaceLayout>
        <div className="flex-1 flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      <div className="flex-1 overflow-y-auto bg-white p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                Workspace Members
              </h1>
              <p className="text-slate-500 mt-2 font-medium">
                {isOwner ? 'Manage your team and join requests.' : 'View all workspace members.'}
              </p>
            </div>
            
            {/* Search Input and Add Member */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-slate-50 border border-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>
              {isOwner && (
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite Member
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation - Only show for owners */}
          {isOwner && (
            <div className="flex items-center gap-4 border-b border-slate-200 pb-px">
              <button
                onClick={() => setActiveTab('approved')}
                className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'approved' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Current Team ({approvedMembers.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Pending Requests
                {pendingMembers.length > 0 && (
                  <span className="bg-orange-100 text-orange-700 py-0.5 px-2 rounded-full text-[10px]">
                    {pendingMembers.length}
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* For owners: show tabs, for regular users: show only approved members */}
            {(isOwner && activeTab === 'approved') || !isOwner ? (
              <div className="divide-y divide-slate-100">
                {filteredApprovedMembers.length > 0 ? filteredApprovedMembers.map((member) => (
                  <div key={member.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div 
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                      onClick={() => handleViewProfile(member)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shadow-inner">
                        {member.user?.profileImage ? (
                          <img 
                            src={member.user.profileImage} 
                            alt={member.user?.name || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-blue-600 font-bold text-lg">
                            {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                          {member.user?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">{member.user?.email || 'No email provided'}</p>
                        {member.user?.bio && (
                          <p className="text-xs text-slate-400 mt-1 truncate">{member.user.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {member.role === 'owner' ? (
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full border border-purple-100">
                          Owner
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 ${member.status === 'blocked' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-slate-100 text-slate-600 border-slate-200'} text-xs font-bold uppercase tracking-wider rounded-full border`}>
                            {member.status === 'blocked' ? 'Blocked' : 'Member'}
                          </span>
                          {/* Owner actions - only show for owners */}
                          {isOwner && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveMember(member.userId);
                                }}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg border border-red-200 transition-colors"
                              >
                                Remove
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBlockMember(member.userId, member.status === 'blocked' ? 'unblock' : 'block');
                                }}
                                className={`px-3 py-1 ${member.status === 'blocked' ? 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200' : 'bg-slate-800 hover:bg-slate-900 text-white border-slate-700'} text-xs font-bold rounded-lg border transition-colors`}
                              >
                                {member.status === 'blocked' ? 'Unblock' : 'Block'}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-slate-500 font-medium">
                    {searchQuery ? `No members found matching "${searchQuery}"` : 'No approved members found.'}
                  </div>
                )}
              </div>
            ) : (
              /* Pending requests tab - only for owners */
              <div className="divide-y divide-slate-100">
                {filteredPendingMembers.length > 0 ? filteredPendingMembers.map((member) => (
                  <div key={member.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-orange-50/30 transition-colors">
                    <div 
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                      onClick={() => handleViewProfile(member)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-100 to-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden shadow-inner">
                        {member.user?.profileImage ? (
                          <img 
                            src={member.user.profileImage} 
                            alt={member.user?.name || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-orange-600 font-bold text-lg">
                            {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 hover:text-orange-600 transition-colors">
                          {member.user?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">
                          {member.user?.email || 'No email provided'}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-orange-600 font-medium bg-orange-100 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" /> Pending Approval
                        </span>
                        {member.user?.bio && (
                          <p className="text-xs text-slate-400 mt-1 truncate">{member.user.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinRequest(member.userId, 'approve');
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl transition-colors border border-emerald-200 shadow-sm"
                      >
                        <UserCheck className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinRequest(member.userId, 'reject');
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-colors border border-red-200 shadow-sm"
                      >
                        <UserX className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <UserCheck className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">
                      {searchQuery ? `No pending requests found matching "${searchQuery}"` : 'No pending join requests.'}
                    </p>
                    {!searchQuery && (
                      <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
      
      {workspaceId && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          workspaceId={workspaceId}
        />
      )}
    </WorkspaceLayout>
  );
};
