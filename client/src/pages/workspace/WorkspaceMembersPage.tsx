import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { WorkspaceService } from '../../api/workspace/workspace.service';
import { WorkspaceLayout } from '../../layouts/WorkspaceLayout';
import { Users, UserCheck, UserX, Clock, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/index';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface MemberData {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  status: string;
  joinedAt: string;
  user?: { name: string; email: string; avatar?: string };
}

export const WorkspaceMembersPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchMembers();
  }, [workspaceId]);

  async function fetchMembers() {
    if (!workspaceId) return;
    try {
      setIsLoading(true);
      const data = await WorkspaceService.getWorkspaceMembers(workspaceId);
      setMembers(data.data);
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
              <p className="text-slate-500 mt-2 font-medium">Manage your team and join requests.</p>
            </div>
          </div>

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
            {activeTab === 'approved' ? (
              <div className="divide-y divide-slate-100">
                {approvedMembers.length > 0 ? approvedMembers.map((member) => (
                  <div key={member.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-inner">
                        {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{member.user?.name || 'Unknown User'}</h3>
                        <p className="text-sm text-slate-500">{member.user?.email || 'No email provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {member.role === 'owner' ? (
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full border border-purple-100">
                          Owner
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 ${member.status === 'blocked' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-slate-100 text-slate-600 border-slate-200'} text-xs font-bold uppercase tracking-wider rounded-full border`}>
                            {member.status === 'blocked' ? 'Blocked' : 'Member'}
                          </span>
                          {isOwner && (
                            <>
                              <button
                                onClick={() => handleRemoveMember(member.userId)}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg border border-red-200 transition-colors"
                              >
                                Remove
                              </button>
                              <button
                                onClick={() => handleBlockMember(member.userId, member.status === 'blocked' ? 'unblock' : 'block')}
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
                  <div className="p-12 text-center text-slate-500 font-medium">No approved members found.</div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingMembers.length > 0 ? pendingMembers.map((member) => (
                  <div key={member.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-orange-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-100 to-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg shadow-inner">
                        {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{member.user?.name || 'Unknown User'}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          {member.user?.email || 'No email provided'}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-orange-600 font-medium bg-orange-100 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" /> Pending Approval
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleJoinRequest(member.userId, 'approve')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl transition-colors border border-emerald-200 shadow-sm"
                      >
                        <UserCheck className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleJoinRequest(member.userId, 'reject')}
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
                    <p className="text-slate-500 font-medium">No pending join requests.</p>
                    <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </WorkspaceLayout>
  );
};
