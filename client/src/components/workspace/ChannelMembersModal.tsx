import { useState, useEffect } from 'react';
import { X, UserMinus, Plus, Shield, Check, XCircle } from 'lucide-react';
import { ChannelService } from '../../api/workspace/channel.service';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { useSocket } from '../../hooks/useSocket';
import type { RootState } from '../../store/index';
import type { ChannelMembersModalProps } from '../../types/component.types';
import type { ChannelMemberData } from '../../types/channel.types';

export const ChannelMembersModal = ({ isOpen, onClose, workspaceId, channelId, channelCreatorId, channelPrivacy, onOpenAddMember, onMemberRemoved }: ChannelMembersModalProps) => {
  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');
  const [members, setMembers] = useState<ChannelMemberData[]>([]);
  const [requests, setRequests] = useState<ChannelMemberData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const socket = useSocket(workspaceId);

  const isCreator = user?.id === channelCreatorId;
  const canRemoveMembers = isCreator && channelPrivacy === 'private';

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('members');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && workspaceId && channelId) {
      // Always fetch fresh data when modal opens
      fetchMembers();
      if (isCreator) {
        fetchRequests();
      }
    }
  }, [isOpen, workspaceId, channelId]);

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!socket || !isOpen || !channelId) return;

    const handleMemberRemoved = (data: { userId: string, userName: string, removedBy: string }) => {
      // Update the members list immediately
      setMembers(prev => prev.filter(m => m.userId !== data.userId));
      
      // Also notify parent to update
      if (onMemberRemoved) {
        onMemberRemoved();
      }
    };

    socket.on('member_removed', handleMemberRemoved);

    return () => {
      socket.off('member_removed', handleMemberRemoved);
    };
  }, [socket, isOpen, channelId, onMemberRemoved]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await ChannelService.getMembers(workspaceId, channelId);
      if (res.data) {
        const memberData = res.data.data ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        setMembers(memberData);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to fetch members');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await ChannelService.getRequests(workspaceId, channelId);
      if (res.data?.success) {
        setRequests(res.data.data || []);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch requests', error);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const result = await Swal.fire({
      title: 'Remove Member?',
      text: `Are you sure you want to remove ${memberName} from this channel?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;
    
    try {
      const res = await ChannelService.removeMember(workspaceId, channelId, memberId);
      if (res.data?.success) {
        toast.success(`${memberName} has been removed`);
        // Update local state immediately
        setMembers(prev => prev.filter(m => m.userId !== memberId));
        // Notify parent to refresh
        if (onMemberRemoved) {
          onMemberRemoved();
        }
        // Refresh the members list from server to ensure consistency
        await fetchMembers();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleRequestAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const res = await ChannelService.updateRequest(workspaceId, channelId, userId, action);
      if (res.data?.success) {
        toast.success(action === 'approve' ? 'Request approved' : 'Request rejected');
        setRequests(prev => prev.filter(r => r.userId !== userId));
        if (action === 'approve') {
          fetchMembers(); // refresh members list
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex flex-col border-b border-slate-100">
          <div className="flex items-center justify-between p-6 pb-2">
            <h2 className="text-xl font-bold text-slate-900">Channel Members</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {isCreator && (
            <div className="flex items-center px-6 gap-6 border-t border-slate-100 pt-2">
              <button 
                onClick={() => setActiveTab('members')}
                className={`py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Members ({members.length})
              </button>
              <button 
                onClick={() => setActiveTab('requests')}
                className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Requests 
                {requests.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.length}</span>
                )}
              </button>
            </div>
          )}
        </div>

        {activeTab === 'members' && (
          <>
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <p className="text-sm font-medium text-slate-600">{members.length} members</p>
              <button 
                onClick={() => {
                  onClose();
                  onOpenAddMember();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Member
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-1">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                          {member.user?.profileImage ? (
                            <img src={member.user.profileImage} alt={member.user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold uppercase">
                              {member.user?.name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            <span className="truncate">{member.user?.name}</span>
                            {member.userId === channelCreatorId && (
                              <span title="Channel Creator" className="flex-shrink-0">
                                <Shield className="w-3.5 h-3.5 text-yellow-500" />
                              </span>
                            )}
                            {member.userId === user?.id && (
                              <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium flex-shrink-0">You</span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">{member.user?.email}</p>
                        </div>
                      </div>
                      
                      {canRemoveMembers && member.userId !== channelCreatorId && (
                        <button 
                          onClick={() => handleRemoveMember(member.userId, member.user?.name || 'User')}
                          className="p-2 ml-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                          title="Remove Member"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {members.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-slate-500">
                      No members found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'requests' && isCreator && (
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      {req.user?.profileImage ? (
                        <img src={req.user.profileImage} alt={req.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold uppercase">
                          {req.user?.name?.[0] || '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {req.user?.name}
                      </h4>
                      <p className="text-xs text-slate-500">{req.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleRequestAction(req.userId, 'approve')}
                      className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleRequestAction(req.userId, 'reject')}
                      className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {requests.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No pending requests.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
