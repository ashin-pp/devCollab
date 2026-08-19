import { useState, useEffect } from 'react';
import { X, Check, Search } from 'lucide-react';
import { ChannelService } from '../../api/workspace/channel.service';
import { WorkspaceService } from '../../api/workspace/workspace.service';
import toast from 'react-hot-toast';
import type { AddChannelMemberModalProps } from '../../types/component.types';
import type { ChannelMemberData } from '../../types/channel.types';
import type { MemberData } from '../../types/workspace.types';

export const AddChannelMemberModal = ({ isOpen, onClose, workspaceId, channelId }: AddChannelMemberModalProps) => {
  const [workspaceMembers, setWorkspaceMembers] = useState<MemberData[]>([]);
  const [channelMembers, setChannelMembers] = useState<ChannelMemberData[]>([]);
  const [blockedMembers, setBlockedMembers] = useState<ChannelMemberData[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && workspaceId && channelId) {
      fetchData();
      setSelectedUserIds(new Set());
      setSearchQuery('');
    }
  }, [isOpen, workspaceId, channelId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [wsRes, chRes, blockedRes] = await Promise.all([
        WorkspaceService.getWorkspaceMembers(workspaceId, false),
        ChannelService.getMembers(workspaceId, channelId),
        ChannelService.getBlockedMembers(workspaceId, channelId)
      ]);
      
      const wsData = wsRes.data ? (Array.isArray(wsRes.data) ? wsRes.data : wsRes.data.data || []) : [];
      const chData = chRes.data ? (chRes.data.data ? chRes.data.data : (Array.isArray(chRes.data) ? chRes.data : [])) : [];
      const blockedData = blockedRes.data ? (blockedRes.data.data ? blockedRes.data.data : (Array.isArray(blockedRes.data) ? blockedRes.data : [])) : [];
      
      setWorkspaceMembers(wsData);
      setChannelMembers(chData);
      setBlockedMembers(blockedData);
    } catch (error: unknown) {
      toast.error('Failed to fetch members data');
    } finally {
      setIsLoading(false);
    }
  };

  const channelMemberUserIds = new Set([
    ...channelMembers.map(m => m.userId),
    ...blockedMembers.map(m => m.userId)
  ]);
  
  const availableMembers = workspaceMembers.filter(m => 
    !channelMemberUserIds.has(m.userId) && 
    (m.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     m.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleSelection = (userId: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleAddMembers = async () => {
    if (selectedUserIds.size === 0) return;
    
    setIsSubmitting(true);
    try {
      const res = await ChannelService.addMembers(workspaceId, channelId, Array.from(selectedUserIds));
      if (res.data?.success || res.status === 201) {
        toast.success(`Added ${selectedUserIds.size} member(s) to channel`);
        onClose();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to add members');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add Members</h2>
            <p className="text-sm text-slate-500 mt-1">Select workspace members to add to this channel</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : availableMembers.length > 0 ? (
            <div className="space-y-1">
              {availableMembers.map((member) => {
                const isSelected = selectedUserIds.has(member.userId);
                return (
                  <div 
                    key={member.id} 
                    onClick={() => toggleSelection(member.userId)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'border-transparent hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        {member.user?.profileImage ? (
                          <img src={member.user.profileImage} alt={member.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold uppercase">
                            {member.user?.name?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className={`font-semibold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                          {member.user?.name}
                        </h4>
                        <p className={`text-xs ${isSelected ? 'text-blue-600/70' : 'text-slate-500'}`}>
                          {member.user?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'}`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm font-medium">No available members found.</p>
              <p className="text-slate-400 text-xs mt-1">Everyone in the workspace is already in this channel, or your search didn't match anyone.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <button 
            onClick={handleAddMembers}
            disabled={selectedUserIds.size === 0 || isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              `Add ${selectedUserIds.size > 0 ? selectedUserIds.size : ''} Members`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
