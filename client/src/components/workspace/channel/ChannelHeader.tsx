import { Hash, Lock, ChevronDown, Users, Settings, LogOut, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { ChannelService } from '../../../api/workspace/channel.service';
import type { ChannelHeaderProps } from '../../../types/component.types';

export const ChannelHeader = ({
  currentChannel,
  isChannelMember,
  user,
  pendingRequestsCount,
  workspaceId,
  channelId,
  channelMembers,
  isChannelDropdownOpen,
  setIsChannelDropdownOpen,
  setShowMembersSidebar,
  onCloseThread,
  setIsSettingsModalOpen,
  navigate,
  openAiDashboard,
  aiAssistantEnabled = true,
}: ChannelHeaderProps) => {
  const handleAiClick = (tab: 'tasks' | 'reminders' | 'notifications' | 'schedule') => {
    if (!aiAssistantEnabled) {
      toast.error('AI Assistant is locked on this workspace plan. Upgrade to enable it.');
      navigate('/billing');
      return;
    }
    openAiDashboard(tab);
  };

  const aiChipClass = aiAssistantEnabled
    ? 'px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md border border-blue-100 flex items-center gap-1 cursor-pointer hover:bg-blue-200 transition-colors'
    : 'px-2 py-0.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded-md border border-slate-200 flex items-center gap-1 cursor-not-allowed opacity-80';

  return (
    <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white">
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => isChannelMember && setIsChannelDropdownOpen(!isChannelDropdownOpen)}
            disabled={!isChannelMember}
            className={`font-bold text-slate-900 text-lg flex items-center px-2 py-1 rounded transition-colors ${isChannelMember ? 'hover:bg-slate-100' : 'cursor-default'}`}
          >
            {currentChannel?.privacy === 'private' ? (
              <Lock className="w-5 h-5 text-orange-500 mr-1" />
            ) : (
              <Hash className="w-5 h-5 text-blue-600 mr-1" />
            )}
            {currentChannel?.name || 'channel'}
            {currentChannel?.privacy === 'private' ? (
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                Private
              </span>
            ) : (
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                Public
              </span>
            )}
            {currentChannel?.createdBy === user?.id && currentChannel?.privacy === 'private' && pendingRequestsCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" title={`${pendingRequestsCount} pending request${pendingRequestsCount > 1 ? 's' : ''}`}>
                {pendingRequestsCount}
              </span>
            )}
            {isChannelMember && <ChevronDown className="w-4 h-4 ml-1 text-slate-500" />}
          </button>

          {isChannelMember && isChannelDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 shadow-lg rounded-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  {currentChannel?.privacy === 'private' ? (
                    <Lock className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Hash className="w-4 h-4 text-blue-600" />
                  )}
                  <h3 className="font-bold text-slate-900">{currentChannel?.name || 'channel'}</h3>
                  {currentChannel?.privacy === 'private' ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                      Private
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                      Public
                    </span>
                  )}
                </div>
                {currentChannel?.description && (
                  <p className="text-xs text-slate-500 mt-1">{currentChannel.description}</p>
                )}
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowMembersSidebar(true); onCloseThread(); setIsChannelDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                >
                  <Users className="w-4 h-4" /> View Members
                  {currentChannel?.createdBy === user?.id && currentChannel?.privacy === 'private' && pendingRequestsCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>

                {currentChannel?.createdBy === user?.id && (
                  <button
                    onClick={() => { setIsSettingsModalOpen(true); setIsChannelDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Channel Settings
                  </button>
                )}
              </div>
              {currentChannel?.createdBy !== user?.id && (
                <div className="py-1 border-t border-slate-100">
                  <button
                    onClick={async () => {
                      setIsChannelDropdownOpen(false);

                      const result = await Swal.fire({
                        title: 'Leave Channel?',
                        text: "Are you sure you want to leave this channel?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#ef4444',
                        cancelButtonColor: '#64748b',
                        confirmButtonText: 'Yes, leave channel'
                      });

                      if (!result.isConfirmed) return;

                      try {
                        await ChannelService.leaveChannel(workspaceId as string, channelId as string);
                        navigate(`/workspace/${workspaceId}/channels`);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Leave Channel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {isChannelMember && (
          <button className="text-slate-400 hover:text-yellow-500 transition-colors">
            <Star className="w-4 h-4" />
          </button>
        )}
      </div>

      {isChannelMember && (
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            title={aiAssistantEnabled ? 'AI tasks' : 'AI locked — upgrade plan'}
            onClick={() => handleAiClick('tasks')}
            className={aiChipClass}
          >
            {aiAssistantEnabled ? null : <Lock className="w-3 h-3" />}
            /task <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px]">3</span>
          </button>
          <button
            type="button"
            title={aiAssistantEnabled ? 'AI notifications' : 'AI locked — upgrade plan'}
            onClick={() => handleAiClick('notifications')}
            className={aiChipClass}
          >
            {aiAssistantEnabled ? null : <Lock className="w-3 h-3" />}
            /notify
          </button>
          <button
            type="button"
            title={aiAssistantEnabled ? 'AI reminders' : 'AI locked — upgrade plan'}
            onClick={() => handleAiClick('reminders')}
            className={aiChipClass}
          >
            {aiAssistantEnabled ? null : <Lock className="w-3 h-3" />}
            /remind <span className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[9px]">5</span>
          </button>
          <button
            type="button"
            title={aiAssistantEnabled ? 'AI schedule' : 'AI locked — upgrade plan'}
            onClick={() => handleAiClick('schedule')}
            className={aiChipClass}
          >
            {aiAssistantEnabled ? null : <Lock className="w-3 h-3" />}
            /schedule
          </button>
        </div>

        <div className="flex items-center">
          <div
            onClick={() => { setShowMembersSidebar(true); onCloseThread(); }}
            className="flex items-center cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            title="View Channel Members"
          >
            {channelMembers.slice(0, 3).map((member, index) => {
              const bgColors = ['bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-orange-100 text-orange-700'];
              const zIndexes = ['z-30', 'z-20', 'z-10'];
              return member.user?.profileImage ? (
                <img
                  key={member.id}
                  src={member.user.profileImage}
                  alt={member.user.name}
                  className={`w-7 h-7 rounded-full border-2 border-white object-cover ${zIndexes[index]}`}
                />
              ) : (
                <div key={member.id} className={`w-7 h-7 rounded-full ${bgColors[index % bgColors.length]} border-2 border-white flex items-center justify-center text-[10px] font-bold ${zIndexes[index]}`}>
                  {member.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              );
            })}
            {channelMembers.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 z-0">
                +{channelMembers.length - 3}
              </div>
            )}
            {channelMembers.length === 0 && (
              <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                0
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </header>
  );
};
