import { useState, useEffect } from 'react';
import { X, UserMinus, Plus, Shield, Check, XCircle, Search, Ban, Unlock } from 'lucide-react';
import { ChannelService } from '../../api/workspace/channel.service';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { useSocket } from '../../hooks/useSocket';
import type { RootState } from '../../store/index';
import type { ChannelMemberData } from '../../types/channel.types';

export interface ChannelMembersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  channelId: string;
  channelName: string;
  channelCreatorId?: string;
  channelPrivacy?: 'public' | 'private';
  isWorkspaceOwner?: boolean;
  onOpenAddMember: () => void;
  onMemberRemoved?: () => void;
}

export const ChannelMembersSidebar = ({ 
  isOpen, onClose, workspaceId, channelId, channelName, channelCreatorId, channelPrivacy, isWorkspaceOwner, onOpenAddMember, onMemberRemoved 
}: ChannelMembersSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'members' | 'requests' | 'blocked'>('members');
  const [members, setMembers] = useState<ChannelMemberData[]>([]);
  const [requests, setRequests] = useState<ChannelMemberData[]>([]);
  const [blockedMembers, setBlockedMembers] = useState<ChannelMemberData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const user = useSelector((state: RootState) => state.auth.user);
  const socket = useSocket(workspaceId);

  const isCreator = user?.id === channelCreatorId;
  const canRemoveMembers = isWorkspaceOwner || (isCreator && channelPrivacy === 'private');
  
  // Expose tabs to owners or creators
  const hasElevatedPrivileges = isCreator || isWorkspaceOwner;

  // Reset state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('members');
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && workspaceId && channelId) {
      fetchMembers();
      if (hasElevatedPrivileges) {
        if (channelPrivacy === 'private') {
          fetchRequests();
        } else if (channelPrivacy === 'public') {
          fetchBlocked();
        }
      }
    }
  }, [isOpen, workspaceId, channelId]);

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!socket || !isOpen || !channelId) return;

    const handleMemberRemoved = (data: { userId: string, userName: string, removedBy: string }) => {
      setMembers(prev => prev.filter(m => m.userId !== data.userId));
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

  const fetchBlocked = async () => {
    try {
      const res = await ChannelService.getBlockedMembers(workspaceId, channelId);
      if (res.data?.success) {
        setBlockedMembers(res.data.data || []);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch blocked members', error);
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
      if (res.status === 200 || res.data?.success) {
        toast.success(`${memberName} has been removed`);
        setMembers(prev => prev.filter(m => m.userId !== memberId));
        if (onMemberRemoved) {
          onMemberRemoved();
        }
        await fetchMembers();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };
  const handleBlockMember = async (memberId: string, memberName: string) => {
    const result = await Swal.fire({
      title: 'Block Member?',
      text: `Are you sure you want to permanently block ${memberName} from this public channel? They will not be able to rejoin.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, block',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;
    
    try {
      const res = await ChannelService.blockMember(workspaceId, channelId, memberId);
      if (res.status === 200 || res.data?.success) {
        toast.success(`${memberName} has been blocked`);
        setMembers(prev => prev.filter(m => m.userId !== memberId));
        if (onMemberRemoved) {
          onMemberRemoved();
        }
        await fetchMembers();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to block member');
    }
  };

  const handleUnblockMember = async (memberId: string, memberName: string) => {
    const result = await Swal.fire({
      title: 'Unblock Member?',
      text: `Are you sure you want to unblock ${memberName}? They will be able to join the channel again.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, unblock',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;
    
    try {
      const res = await ChannelService.unblockMember(workspaceId, channelId, memberId);
      if (res.status === 200 || res.data?.success) {
        toast.success(`${memberName} has been unblocked`);
        setBlockedMembers(prev => prev.filter(m => m.userId !== memberId));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to unblock member');
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

  const filteredMembers = members.filter(m => m.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredRequests = requests.filter(r => r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredBlocked = blockedMembers.filter(m => m.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-[320px] md:w-[380px] bg-white flex flex-col shrink-0 border-l border-slate-200 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] relative z-10">
      
      {/* Header */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-5 shrink-0 bg-white">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base tracking-tight">Members</h3>
          <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]"># {channelName}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-all active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      {hasElevatedPrivileges && (
        <div className="p-3 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <div className="flex bg-slate-200/50 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'members' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Members <span className="ml-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">{members.length}</span>
            </button>
            {channelPrivacy === 'private' && (
              <button 
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'requests' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Requests 
                {requests.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">{requests.length}</span>
                )}
              </button>
            )}
            {channelPrivacy === 'public' && (
              <button 
                onClick={() => setActiveTab('blocked')}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'blocked' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Blocked 
                {blockedMembers.length > 0 && (
                  <span className="ml-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">{blockedMembers.length}</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search and Action Bar */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-col gap-3 shrink-0 bg-white">
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search members..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
          />
        </div>
        
        {activeTab === 'members' && (
          <button 
            onClick={onOpenAddMember}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:transform active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Add New Member
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-2 bg-white">
        
        {/* Members Tab */}
        {activeTab === 'members' && (
          <>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        {member.user?.profileImage ? (
                          <img src={member.user.profileImage} alt={member.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold uppercase text-xs">
                            {member.user?.name?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                          <span className="truncate">{member.user?.name}</span>
                          {member.userId === channelCreatorId && (
                            <span title="Channel Creator" className="flex-shrink-0">
                              <Shield className="w-3.5 h-3.5 text-yellow-500" />
                            </span>
                          )}
                          {member.userId === user?.id && (
                            <span className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold flex-shrink-0">You</span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">{member.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasElevatedPrivileges && channelPrivacy === 'public' && member.userId !== channelCreatorId && (
                        <button 
                          onClick={() => handleBlockMember(member.userId, member.user?.name || 'User')}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                          title="Block Member"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      {canRemoveMembers && member.userId !== channelCreatorId && (
                        <button 
                          onClick={() => handleRemoveMember(member.userId, member.user?.name || 'User')}
                          className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                          title="Remove Member"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredMembers.length === 0 && !isLoading && (
                  <div className="text-center py-10 px-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No members found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search query.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && hasElevatedPrivileges && (
          <div className="space-y-1">
            {filteredRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    {req.user?.profileImage ? (
                      <img src={req.user.profileImage} alt={req.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold uppercase text-xs">
                        {req.user?.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 pr-2">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">
                      {req.user?.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{req.user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 flex-shrink-0">
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
            
            {filteredRequests.length === 0 && (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No pending requests</p>
                <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
              </div>
            )}
          </div>
        )}

        {/* Blocked Tab */}
        {activeTab === 'blocked' && (
          <div className="space-y-1">
            {filteredBlocked.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    {member.user?.profileImage ? (
                      <img src={member.user.profileImage} alt={member.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-bold uppercase text-xs">
                        {member.user?.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 pr-2">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">
                      {member.user?.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{member.user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button 
                    onClick={() => handleUnblockMember(member.userId, member.user?.name || 'User')}
                    className="p-1.5 px-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
                    title="Unblock"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Unblock
                  </button>
                </div>
              </div>
            ))}
            
            {filteredBlocked.length === 0 && (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No blocked members</p>
                <p className="text-xs text-slate-500 mt-1">Everyone is welcome here.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
