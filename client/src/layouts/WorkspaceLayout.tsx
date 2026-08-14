import { useState, useEffect } from 'react';
import {
  Bell, HelpCircle, Settings, User as UserIcon,
  Hash, MessageSquare, BarChart2, Users, UserCircle,
  LogOut, Plus, ChevronDown, ChevronRight, ArrowLeft, Lock, Copy
} from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { WorkspaceService } from '../api/workspace/workspace.service';
import { ChannelService } from '../api/workspace/channel.service';
import { DMService } from '../api/dm/dm.service';
import { useSocket } from '../hooks/useSocket';
import type { ChannelData } from '../types/channel.types';
import type { MemberData } from '../types/workspace.types';
import type { Conversation, DirectMessage } from '../types/dm.types';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { CreateChannelModal } from '../components/workspace/CreateChannelModal';
import { InviteMemberModal } from '../components/workspace/InviteMemberModal';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { addNotification } from '../store/slices/notificationSlice';
import { useDispatch } from 'react-redux';
import { playNotificationSound } from '../utils/audio';
import { UserService } from '../api/user/user.service';
import { isSubscriptionExpiredError } from '../utils/subscription.utils';

import type { WorkspaceLayoutProps } from '../types/component.types';

export const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const socket = useSocket(workspaceId);

  const [isOwner, setIsOwner] = useState(false);
  const [channels, setChannels] = useState<Record<string, unknown>[]>([]);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Loading...');
  const [workspaceLogo, setWorkspaceLogo] = useState<string | undefined>(undefined);
  const [workspacePrivacy, setWorkspacePrivacy] = useState<'public' | 'private'>('private');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [mentions, setMentions] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`mentions_${workspaceId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (workspaceId) {
      localStorage.setItem(`mentions_${workspaceId}`, JSON.stringify(mentions));
    }
  }, [mentions, workspaceId]);
  const [totalUnreadDMs, setTotalUnreadDMs] = useState(0);

  const [isMyChannelsOpen, setIsMyChannelsOpen] = useState(true);
  const [isAllChannelsOpen, setIsAllChannelsOpen] = useState(true);

  const fetchChannels = () => {
    if (workspaceId) {
      ChannelService.getWorkspaceChannels(workspaceId)
        .then(res => {
          const fetchedChannels = res.data?.data || [];
          setChannels(fetchedChannels);
          if (socket) {
            fetchedChannels.forEach((c: any) => socket.emit('join_channel', c.id));
          }
        })
        .catch(err => console.error('Failed to fetch channels', err));

      ChannelService.getUnreadCounts(workspaceId)
        .then(res => {
          if (res.data?.success) {
            setUnreadCounts(res.data.data || {});
          }
        })
        .catch(err => console.error('Failed to fetch unread counts', err));

      DMService.getConversations(workspaceId)
        .then(res => {
          const convs: Conversation[] = res.data?.data || [];
          const unreadTotal = convs.filter((conv: Conversation) => (conv.unreadCount || 0) > 0).length;
          setTotalUnreadDMs(unreadTotal);
        })
        .catch(console.error);
    }
  };

  const updateUnreadCount = (channelId: string) => {
    setUnreadCounts(prev => ({
      ...prev,
      [channelId]: (prev[channelId] || 0) + 1
    }));
  };

  useEffect(() => {
    if (socket) {
      fetchChannels();
    }
  }, [workspaceId, socket]);

  useEffect(() => {
    if (workspaceId && user) {
      WorkspaceService.getUserWorkspaces()
        .then((response: { data?: Array<{ id: string; name: string; logo?: string; inviteCode?: string; privacy?: 'public' | 'private' }> }) => {
          const workspace = response.data?.find((w) => w.id === workspaceId);
          if (workspace) {
            setWorkspaceName(workspace.name);
            setWorkspaceLogo(workspace.logo);
            setInviteCode(workspace.inviteCode || '');
            if (workspace.privacy) {
              setWorkspacePrivacy(workspace.privacy);
            }
          }
        })
        .catch((err) => {
          if (isSubscriptionExpiredError(err)) {
            setIsSubscriptionExpired(true);
            toast.error('Your subscription has expired. Paid features are locked until you renew.');
            return;
          }
          console.error('Failed to fetch workspace data', err);
        });

      UserService.getProfile()
        .then((res) => {
          setIsSubscriptionExpired(Boolean(res?.data?.isSubscriptionExpired));
        })
        .catch(() => {
          /* profile is best-effort for the banner */
        });

      WorkspaceService.getWorkspaceMembers(workspaceId, false).then((response: any) => {
        const members: MemberData[] = Array.isArray(response.data) ? response.data : response.data?.data || [];
        const currentMember = members.find((m) => m.userId === user.id);
        
        if (!currentMember || (currentMember.status !== 'approved' && currentMember.status !== 'invited' && currentMember.role !== 'owner')) {
          toast.error('You are no longer a member of this workspace');
          navigate('/dashboard');
          return;
        }

        setIsOwner(currentMember?.role === 'owner');

        if (currentMember?.role === 'owner') {
          const pendingCount = members.filter((m) => m.status === 'pending').length;
          setPendingRequestsCount(pendingCount);
        }
      }).catch((error: unknown) => {
        const err = error as { response?: { status?: number, data?: { message?: string, error?: { message?: string } } } };
        if (err.response?.status === 403 || err.response?.status === 404) {
          toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Access Denied');
          navigate('/dashboard');
        } else {
          console.error('Failed to fetch workspace role', err);
        }
      });
    }
  }, [workspaceId, user, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket?.on('workspace_member_removed', (data: { userId: string, workspaceId: string, removedBy?: string }) => {
      if (data.userId === user?.id && data.workspaceId === workspaceId) {
        if (data.removedBy && data.removedBy !== user?.id) {
          toast.error('You have been removed from this workspace');
          navigate('/dashboard');
        }
      }
    });

    const handleNewMessage = (message: { channelId: string; senderId: string; content?: string }) => {
      if (message.senderId !== user?.id) {
        const currentChannelId = location.pathname.split('/channels/')[1];
        if (currentChannelId !== message.channelId) {
          updateUnreadCount(message.channelId);
          if (message.content && user?.id && message.content.includes(`data-mention-id="${user.id}"`)) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = message.content;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';
            setMentions(prev => ({
              ...prev,
              [message.channelId]: plainText
            }));
          }
        }
      }
    };

    const handleNewNotification = (notification: any) => {
      playNotificationSound();
      dispatch(addNotification(notification));
      toast.success(`New Notification: ${notification.title}`, { icon: '🔔' });
    };

    socket.on('message_received', handleNewMessage);

    const handleDMReceived = (message: DirectMessage) => {
      if (workspaceId) {
        DMService.getConversations(workspaceId)
          .then(res => {
            const convs: Conversation[] = res.data?.data || [];
            const unreadTotal = convs.filter((conv: Conversation) => (conv.unreadCount || 0) > 0).length;
            setTotalUnreadDMs(unreadTotal);
          })
          .catch(console.error);
      }
    };

    socket.on('dm_received', handleDMReceived);
    socket.on('new_notification', handleNewNotification);

    if (workspaceId) {
      DMService.getConversations(workspaceId)
        .then(res => {
          const convs: Conversation[] = res.data?.data || [];
          convs.forEach((conv: Conversation) => {
            socket.emit('join_conversation', conv.id);
          });
        })
        .catch(console.error);
    }

    return () => {
      socket.off('message_received', handleNewMessage);
      socket.off('dm_received', handleDMReceived);
      socket.off('workspace_member_removed');
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, user, location.pathname, workspaceId, navigate, dispatch]);

  useEffect(() => {
    const handleChannelRead = (event: Event) => {
      const customEvent = event as CustomEvent<{ channelId: string }>;
      const { channelId } = customEvent.detail;
      setUnreadCounts(prev => ({
        ...prev,
        [channelId]: 0
      }));
      setMentions(prev => {
        const next = { ...prev };
        delete next[channelId];
        return next;
      });
    };

    window.addEventListener('channel-read', handleChannelRead);

    const handleDMRead = (event: Event) => {
      if (workspaceId) {
        DMService.getConversations(workspaceId)
          .then(res => {
            const convs: Conversation[] = res.data?.data || [];
            const unreadTotal = convs.filter((conv: Conversation) => (conv.unreadCount || 0) > 0).length;
            setTotalUnreadDMs(unreadTotal);
          })
          .catch(console.error);
      }
    };

    window.addEventListener('dm-read', handleDMRead);

    return () => {
      window.removeEventListener('channel-read', handleChannelRead);
      window.removeEventListener('dm-read', handleDMRead);
    };
  }, [workspaceId]);

  const isActive = (path: string) => location.pathname.includes(path);

  const handleLeaveWorkspace = async () => {
    if (!workspaceId || !user) return;
    try {
      const result = await Swal.fire({
        title: 'Leave Workspace?',
        text: "Are you sure you want to leave this workspace?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Yes, Leave'
      });

      if (result.isConfirmed) {
        await WorkspaceService.removeMember(workspaceId, user.id);
        toast.success('You have left the workspace');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to leave workspace');
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden font-sans">

      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0 bg-white z-20">
        <div className="flex items-center gap-6 w-64 shrink-0">
          <div className="font-bold text-xl tracking-tight text-blue-600 cursor-pointer" onClick={() => navigate('/dashboard')}>
            DevCollab
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-medium text-sm border-l border-slate-200 pl-4">
            <span className="w-4 h-4 grid grid-cols-2 gap-[2px]">
              <div className="bg-slate-400 rounded-sm"></div>
              <div className="bg-slate-400 rounded-sm"></div>
              <div className="bg-slate-400 rounded-sm"></div>
              <div className="bg-slate-400 rounded-sm"></div>
            </span>
            Workspaces
          </div>
        </div>

        <div className="flex-1 max-w-2xl px-4">
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <NotificationBell />
          <button className="text-slate-500 hover:text-slate-700 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          {isOwner ? (
            <button className="text-slate-500 hover:text-slate-700 transition-colors" onClick={() => navigate(`/workspace/${workspaceId}/settings`)}>
              <Settings className="w-5 h-5" />
            </button>
          ) : (
            <button className="text-slate-500 hover:text-red-600 transition-colors" onClick={handleLeaveWorkspace} title="Leave Workspace">
              <LogOut className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => navigate('/profile', { state: { fromWorkspace: workspaceId } })} className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 ml-1 hover:border-slate-400 hover:ring-2 hover:ring-blue-100 transition-all cursor-pointer" title="Go to Profile">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-slate-500 m-auto mt-1.5" />
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        <aside className="w-[280px] bg-slate-50/50 backdrop-blur-xl border-r border-slate-200 flex flex-col shrink-0 relative transition-all duration-300">

          {/* Workspace Header - Premium Glass Effect */}
          <div onClick={() => navigate(`/workspace/${workspaceId}/dashboard`)} className="p-5 border-b border-slate-200/60 bg-white/40 relative overflow-hidden group cursor-pointer hover:bg-white/60 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-125"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/20 overflow-hidden shrink-0 border border-blue-400/20">
                {workspaceLogo ? (
                  <img src={workspaceLogo} alt={workspaceName} className="w-full h-full object-cover" />
                ) : (
                  <span>{workspaceName.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-extrabold text-slate-900 leading-tight truncate text-lg tracking-tight" title={workspaceName}>
                  {workspaceName}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full shadow-sm ${workspacePrivacy === 'public' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-orange-500 shadow-orange-500/40'}`}></span>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{workspacePrivacy} Workspace</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-6 hide-scrollbar relative">

            {/* Core Tools Section */}
            <div className="space-y-1">
              <div className="px-2 mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Main Menu</span>
              </div>

              <div onClick={() => navigate(`/workspace/${workspaceId}/dm`)} className={`group flex items-center justify-between text-sm py-2.5 px-3 rounded-xl cursor-pointer font-bold transition-all duration-200 ${isActive('/dm') ? 'bg-blue-50/80 ring-1 ring-blue-200 shadow-sm text-blue-700' : 'text-slate-600 hover:bg-slate-100/80 active:bg-slate-200/50'}`}>
                <div className="flex items-center gap-3">
                  <MessageSquare className={`w-4.5 h-4.5 ${isActive('/dm') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                  <span>Direct Messages</span>
                </div>
                {totalUnreadDMs > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold rounded-full shadow-md shadow-blue-500/30 transform transition-transform animate-pulse-once shrink-0">
                    {totalUnreadDMs}
                  </span>
                )}
              </div>

              <div onClick={() => navigate(`/workspace/${workspaceId}/polls`)} className={`group flex items-center justify-between text-sm py-2.5 px-3 rounded-xl cursor-pointer font-bold transition-all duration-200 ${isActive('/polls') ? 'bg-blue-50/80 ring-1 ring-blue-200 shadow-sm text-blue-700' : 'text-slate-600 hover:bg-slate-100/80 active:bg-slate-200/50'}`}>
                <div className="flex items-center gap-3">
                  <BarChart2 className={`w-4.5 h-4.5 ${isActive('/polls') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                  <span>Polls</span>
                </div>
                {/* Remove static count if not dynamic, or keep new style */}
              </div>

              <div className={`group flex items-center justify-between text-sm py-2.5 px-3 rounded-xl cursor-pointer font-bold transition-all duration-200 ${isActive('/members') ? 'bg-blue-50/80 ring-1 ring-blue-200 shadow-sm text-blue-700' : 'text-slate-600 hover:bg-slate-100/80 active:bg-slate-200/50'}`}>
                <div className="flex items-center gap-3 flex-1" onClick={() => navigate(`/workspace/${workspaceId}/members`)}>
                  <Users className={`w-4.5 h-4.5 ${isActive('/members') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                  <span>Members </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isOwner && pendingRequestsCount > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-extrabold rounded-full shadow-md shadow-red-500/30 transform transition-transform animate-pulse shrink-0">
                      {pendingRequestsCount} new
                    </span>
                  )}
                  {(isOwner || workspacePrivacy === 'public') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsInviteMemberModalOpen(true); }}
                      className={`p-1.5 rounded-lg transition-colors ${isActive('/members') ? 'hover:bg-blue-100 text-blue-600' : 'hover:bg-slate-200 text-slate-400 hover:text-blue-600'}`}
                      title="Invite Member"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-2 my-1"></div>

            {/* Channels Section */}
            <div className="flex-1">
              <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> Channels
                </span>
                <button
                  onClick={() => setIsCreateChannelModalOpen(true)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200/60 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:shadow-sm hover:bg-blue-50 transition-all shadow-sm"
                  title="Create Channel"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* My Channels */}
                <div>
                  <div
                    onClick={() => setIsMyChannelsOpen(!isMyChannelsOpen)}
                    className="flex items-center justify-between text-slate-400 text-[11px] py-1.5 px-2 font-bold uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-blue-500">🔖</span> My Channels
                    </div>
                    {isMyChannelsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>

                  {isMyChannelsOpen && (
                    <div className="space-y-0.5 mt-1">
                      {channels.filter((c) => c.createdBy === user?.id).map((channel: Record<string, unknown>) => {
                        const isPrivate = channel.privacy === 'private';
                        const channelId = channel.id as string;
                        const unreadCount = unreadCounts[channelId] || 0;

                        return (
                          <div
                            key={channelId}
                            onClick={() => navigate(`/workspace/${workspaceId}/channels/${channelId}`)}
                            className={`group flex items-center justify-between text-sm py-2 px-3 rounded-xl cursor-pointer font-bold transition-all duration-200 ${isActive(`channels/${channelId}`) ? 'bg-blue-50/80 ring-1 ring-blue-200 shadow-sm text-blue-700' : 'text-slate-600 hover:bg-slate-100/80 active:bg-slate-200/50'}`}
                          >
                            <div className="flex items-center truncate gap-2.5 flex-1 min-w-0">
                              {isPrivate ? (
                                <Lock className={`w-4 h-4 transition-colors shrink-0 ${isActive(`channels/${channelId}`) ? 'text-orange-600' : 'text-orange-400 group-hover:text-orange-500'}`} />
                              ) : (
                                <Hash className={`w-4 h-4 transition-colors shrink-0 ${isActive(`channels/${channelId}`) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                              )}
                              <span className={`truncate ${mentions[channelId] ? 'text-blue-700 font-extrabold' : ''}`}>{channel.name as string}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {mentions[channelId] && (
                                <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-extrabold rounded-full shadow-md shadow-orange-500/30 shrink-0">
                                  @
                                </span>
                              )}
                              {unreadCount > 0 && !mentions[channelId] && (
                                <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold rounded-full shadow-md shadow-blue-500/30 transform transition-transform animate-pulse-once shrink-0">
                                  {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                              )}
                              {isActive(`channels/${channelId}`) && !mentions[channelId] && <div className={`w-1.5 h-1.5 rounded-full ${isPrivate ? 'bg-orange-600' : 'bg-blue-600'}`}></div>}
                            </div>
                          </div>
                        );
                      })}

                      {channels.filter(c => c.createdBy === user?.id).length === 0 && (
                        <div className="text-slate-400 text-xs py-2 px-3 pl-9 italic">No channels created</div>
                      )}
                    </div>
                  )}
                </div>

                {/* All Channels */}
                <div>
                  <div
                    onClick={() => setIsAllChannelsOpen(!isAllChannelsOpen)}
                    className="flex items-center justify-between text-slate-400 text-[11px] py-1.5 px-2 font-bold uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">🌍</span> All Channels
                    </div>
                    {isAllChannelsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>

                  {isAllChannelsOpen && (
                    <div className="space-y-0.5 mt-1">
                      {channels.filter((c) => c.createdBy !== user?.id).map((channel: Record<string, unknown>) => {
                        const isPrivate = channel.privacy === 'private';
                        const channelId = channel.id as string;
                        const unreadCount = unreadCounts[channelId] || 0;

                        return (
                          <div
                            key={channelId}
                            onClick={() => navigate(`/workspace/${workspaceId}/channels/${channelId}`)}
                            className={`group flex items-center justify-between text-sm py-2 px-3 rounded-xl cursor-pointer font-bold transition-all duration-200 ${isActive(`channels/${channelId}`) ? 'bg-blue-50/80 ring-1 ring-blue-200 shadow-sm text-blue-700' : 'text-slate-600 hover:bg-slate-100/80 active:bg-slate-200/50'}`}
                          >
                            <div className="flex items-center truncate gap-2.5 flex-1 min-w-0">
                              {isPrivate ? (
                                <Lock className={`w-4 h-4 transition-colors shrink-0 ${isActive(`channels/${channelId}`) ? 'text-orange-600' : 'text-orange-400 group-hover:text-orange-500'}`} />
                              ) : (
                                <Hash className={`w-4 h-4 transition-colors shrink-0 ${isActive(`channels/${channelId}`) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                              )}
                              <span className={`truncate ${mentions[channelId] ? 'text-blue-700 font-extrabold' : ''}`}>{channel.name as string}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {mentions[channelId] && (
                                <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-extrabold rounded-full shadow-md shadow-orange-500/30 shrink-0">
                                  @
                                </span>
                              )}
                              {unreadCount > 0 && !mentions[channelId] && (
                                <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold rounded-full shadow-md shadow-blue-500/30 transform transition-transform animate-pulse-once shrink-0">
                                  {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                              )}
                              {isActive(`channels/${channelId}`) && !mentions[channelId] && <div className={`w-1.5 h-1.5 rounded-full ${isPrivate ? 'bg-orange-600' : 'bg-blue-600'}`}></div>}
                            </div>
                          </div>
                        );
                      })}

                      {channels.filter(c => c.createdBy !== user?.id).length === 0 && (
                        <div className="text-slate-400 text-xs py-2 px-3 pl-9 italic">No other channels</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Area - Profile, Invite, Settings */}
          <div className="p-4 bg-white/40 border-t border-slate-200/60 backdrop-blur-md space-y-3 relative z-10">

            <div
              onClick={() => navigate('/profile', { state: { fromWorkspace: workspaceId } })}
              className="group flex items-center justify-between text-sm py-2.5 px-3 rounded-xl cursor-pointer bg-slate-800 text-white font-medium hover:bg-slate-900 transition-all shadow-md shadow-slate-900/10 border border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden shrink-0 border border-slate-500">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </div>
                <span className="font-bold text-xs tracking-wide">My Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors group-hover:translate-x-0.5" />
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Invite Code</p>
                <p className="font-mono text-xs font-bold text-slate-700 truncate">{inviteCode || '---'}</p>
              </div>
              <button
                onClick={() => {
                  if (inviteCode) {
                    navigator.clipboard.writeText(inviteCode);
                    toast.success('Copied!');
                  }
                }}
                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors shrink-0"
                title="Copy Invite Code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl transition-all shadow-sm hover:text-slate-900 group"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                Exit
              </button>

              {isOwner && (
                <button
                  onClick={() => navigate(`/workspace/${workspaceId}/settings`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl transition-all shadow-sm hover:text-blue-600 group"
                  title="Workspace Settings"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-90 group-hover:text-blue-500 transition-all duration-300" />
                  Settings
                </button>
              )}
            </div>
          </div>

        </aside>

        <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {isSubscriptionExpired && (
            <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5">
              <p className="text-xs sm:text-sm text-amber-900 font-medium">
                Your plan expired — chat stays available. Renew for AI, higher limits, and new workspaces.
              </p>
              <button
                type="button"
                onClick={() => navigate(`/billing?next=/workspace/${workspaceId}/dashboard`)}
                className="self-start sm:self-auto text-xs font-bold uppercase tracking-wide text-amber-900 underline underline-offset-2 hover:text-amber-950"
              >
                Renew
              </button>
            </div>
          )}
          {children}
        </main>

      </div>

      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onClose={() => setIsCreateChannelModalOpen(false)}
        workspaceId={workspaceId || ''}
        existingChannelNames={channels
          .map((c) => (typeof c.name === 'string' ? c.name : ''))
          .filter(Boolean)}
        onSuccess={(newChannel) => {
          const channelWithMembership = { ...newChannel, isMember: true };
          setChannels(prev => [...prev, channelWithMembership]);
          navigate(`/workspace/${workspaceId}/channels/${newChannel.id}`);
        }}
      />

      <InviteMemberModal
        isOpen={isInviteMemberModalOpen}
        onClose={() => setIsInviteMemberModalOpen(false)}
        workspaceId={workspaceId || ''}
      />
    </div>
  );
};
