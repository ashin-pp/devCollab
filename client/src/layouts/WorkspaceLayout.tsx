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
import type { ChannelData } from '../types/channel.types';
import type { MemberData } from '../types/workspace.types';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { CreateChannelModal } from '../components/workspace/CreateChannelModal';

import type { WorkspaceLayoutProps } from '../types/component.types';

export const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [isOwner, setIsOwner] = useState(false);
  const [channels, setChannels] = useState<Record<string, unknown>[]>([]);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Loading...');
  const [workspaceLogo, setWorkspaceLogo] = useState<string | undefined>(undefined);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  
  const [isMyChannelsOpen, setIsMyChannelsOpen] = useState(true);
  const [isAllChannelsOpen, setIsAllChannelsOpen] = useState(true);

  const fetchChannels = () => {
    if (workspaceId) {
      ChannelService.getWorkspaceChannels(workspaceId)
        .then(res => setChannels(res.data?.data || []))
        .catch(err => console.error('Failed to fetch channels', err));
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId && user) {
      // Fetch workspace data
      WorkspaceService.getUserWorkspaces()
        .then((response: { data?: Array<{ id: string; name: string; logo?: string; inviteCode?: string }> }) => {
          const workspace = response.data?.find((w) => w.id === workspaceId);
          if (workspace) {
            setWorkspaceName(workspace.name);
            setWorkspaceLogo(workspace.logo);
            setInviteCode(workspace.inviteCode || '');
          }
        })
        .catch((err) => console.error('Failed to fetch workspace data', err));

      // Fetch workspace members
      WorkspaceService.getWorkspaceMembers(workspaceId, false).then((response: { data?: MemberData[] }) => {
        const members = response.data || [];
        const currentMember = members.find((m) => m.userId === user.id);
        setIsOwner(currentMember?.role === 'owner');
        
        // Count pending requests if user is owner
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

      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0 bg-white z-20">
        {/* Left: Branding */}
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

        {/* Center: Empty space (search removed) */}
        <div className="flex-1 max-w-2xl px-4">
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <button className="text-slate-500 hover:text-slate-700 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
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
          <button className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 ml-1">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-slate-500 m-auto mt-1.5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Sidebar */}
        <aside className="w-[260px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">

          {/* Workspace Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm overflow-hidden">
                {workspaceLogo ? (
                  <img 
                    src={workspaceLogo} 
                    alt={workspaceName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{workspaceName.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-900 leading-tight truncate text-lg" title={workspaceName}>
                  {workspaceName}
                </h2>
                <p className="text-xs text-slate-500">Workspace</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6 hide-scrollbar">

            {/* Channels Group */}
            <div>
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center gap-1 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <ChevronDown className="w-3 h-3" /> Channels
                </div>
                <button 
                  onClick={() => setIsCreateChannelModalOpen(true)}
                  className="p-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors tooltip-trigger"
                  title="Create Channel"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                <div 
                  onClick={() => setIsMyChannelsOpen(!isMyChannelsOpen)}
                  className="flex items-center justify-between text-slate-500 text-xs py-1.5 px-3 font-bold uppercase tracking-wider cursor-pointer hover:bg-slate-100 rounded-md transition-colors"
                >
                  <div className="flex items-center">
                    <span className="mr-2">🔖</span> My Channels
                  </div>
                  {isMyChannelsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </div>

                {isMyChannelsOpen && (
                  <div className="space-y-1">
                    {channels.filter((c) => c.createdBy === user?.id).map((channel: Record<string, unknown>) => {
                      const isPrivate = channel.privacy === 'private';
                      const channelId = channel.id as string;
                      
                      return (
                  <div
                    key={channelId}
                    onClick={() => navigate(`/workspace/${workspaceId}/channels/${channelId}`)}
                    className={`group flex items-center justify-between text-sm py-2 px-3 pl-6 rounded-xl cursor-pointer font-medium transition-all ${isActive(`channels/${channelId}`) ? 'bg-blue-50/80 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'}`}
                  >
                    <div className="flex items-center truncate gap-2 flex-1 min-w-0">
                      {isPrivate ? (
                        <Lock className={`w-4 h-4 transition-colors flex-shrink-0 ${isActive(`channels/${channelId}`) ? 'text-orange-600' : 'text-orange-500 group-hover:text-orange-600'}`} />
                      ) : (
                        <Hash className={`w-4 h-4 transition-colors flex-shrink-0 ${isActive(`channels/${channelId}`) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                      )}
                      <span className="group-hover:translate-x-0.5 transition-transform truncate">{channel.name as string}</span>
                      {isPrivate ? (
                        <span className="ml-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 flex-shrink-0">
                          Private
                        </span>
                      ) : (
                        <span className="ml-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 flex-shrink-0">
                          Public
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isActive(`channels/${channelId}`) && <div className={`w-2 h-2 rounded-full shadow-sm ${isPrivate ? 'bg-orange-600' : 'bg-blue-600'}`}></div>}
                    </div>
                  </div>
                      );
                    })}
                
                    {channels.filter(c => c.createdBy === user?.id).length === 0 && (
                      <div className="text-slate-400 text-xs py-2 px-3 pl-6 italic">No channels created</div>
                    )}
                  </div>
                )}

                <div 
                  onClick={() => setIsAllChannelsOpen(!isAllChannelsOpen)}
                  className="flex items-center justify-between text-slate-500 text-xs py-1.5 px-3 font-bold uppercase tracking-wider cursor-pointer hover:bg-slate-100 rounded-md transition-colors mt-4"
                >
                  <div className="flex items-center">
                    <span className="mr-2">🌍</span> All Channels
                  </div>
                  {isAllChannelsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </div>

                {isAllChannelsOpen && (
                  <div className="space-y-1">
                    {channels.filter((c) => c.createdBy !== user?.id).map((channel: Record<string, unknown>) => {
                      const isPrivate = channel.privacy === 'private';
                      return (
                  <div
                    key={channel.id as string}
                    onClick={() => navigate(`/workspace/${workspaceId}/channels/${channel.id}`)}
                    className={`group flex items-center justify-between text-sm py-2 px-3 pl-6 rounded-xl cursor-pointer font-medium transition-all ${isActive(`channels/${channel.id}`) ? 'bg-blue-50/80 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'}`}
                  >
                    <div className="flex items-center truncate gap-2">
                      {isPrivate ? (
                        <Lock className={`w-4 h-4 transition-colors flex-shrink-0 ${isActive(`channels/${channel.id}`) ? 'text-orange-600' : 'text-orange-500 group-hover:text-orange-600'}`} />
                      ) : (
                        <Hash className={`w-4 h-4 transition-colors flex-shrink-0 ${isActive(`channels/${channel.id}`) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                      )}
                      <span className="group-hover:translate-x-0.5 transition-transform truncate">{channel.name as string}</span>
                      {isPrivate ? (
                        <span className="ml-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 flex-shrink-0">
                          Private
                        </span>
                      ) : (
                        <span className="ml-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 flex-shrink-0">
                          Public
                        </span>
                      )}
                    </div>
                    {isActive(`channels/${channel.id}`) && <div className={`w-2 h-2 rounded-full shadow-sm ${isPrivate ? 'bg-orange-600' : 'bg-blue-600'}`}></div>}
                  </div>
                      );
                    })}

                    {channels.filter(c => c.createdBy !== user?.id).length === 0 && (
                      <div className="text-slate-400 text-xs py-2 px-3 pl-6 italic">No other channels</div>
                    )}
                  </div>
                )}
                
                <div className="pt-2 px-2">
                  <button 
                    onClick={() => setIsCreateChannelModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 rounded-xl text-sm font-semibold transition-all shadow-sm group"
                  >
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                    <span>Create New Channel</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Other Sections */}
            <div className="space-y-1.5 mt-4">
              <div
                onClick={() => navigate(`/workspace/${workspaceId}/dm`)}
                className={`group flex items-center justify-between text-sm py-2 px-3 rounded-xl cursor-pointer font-medium transition-all ${isActive('/dm') ? 'bg-blue-50/80 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'}`}
              >
                <div className="flex items-center">
                  <MessageSquare className={`w-4 h-4 mr-3 transition-colors ${isActive('/dm') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                  <span className="group-hover:translate-x-0.5 transition-transform">Direct Messages</span>
                </div>
                <span className={`${isActive('/dm') ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700'} transition-colors text-[10px] font-bold px-2 py-0.5 rounded-full`}>5</span>
              </div>
              <div
                onClick={() => navigate(`/workspace/${workspaceId}/polls`)}
                className={`group flex items-center justify-between text-sm py-2 px-3 rounded-xl cursor-pointer font-medium transition-all ${isActive('/polls') ? 'bg-blue-50/80 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'}`}
              >
                <div className="flex items-center">
                  <BarChart2 className={`w-4 h-4 mr-3 transition-colors ${isActive('/polls') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                  <span className="group-hover:translate-x-0.5 transition-transform">Polls</span>
                </div>
                <span className={`${isActive('/polls') ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700'} transition-colors text-[10px] font-bold px-2 py-0.5 rounded-full`}>3</span>
              </div>
              <div
                onClick={() => navigate(`/workspace/${workspaceId}/members`)}
                className={`group flex items-center justify-between text-sm py-2 px-3 rounded-xl cursor-pointer font-medium transition-all ${isActive('/members') ? 'bg-blue-50/80 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'}`}
              >
                <div className="flex items-center">
                  <Users className={`w-4 h-4 mr-3 transition-colors ${isActive('/members') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                  <span className="group-hover:translate-x-0.5 transition-transform">Members</span>
                </div>
                {isOwner && pendingRequestsCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingRequestsCount}
                  </span>
                )}
              </div>
              
              <div className="pt-4 mt-2 border-t border-slate-200/60">
                <div
                  onClick={() => navigate('/profile', { state: { fromWorkspace: workspaceId } })}
                  className="group flex items-center justify-between text-sm py-2.5 px-3 rounded-xl cursor-pointer text-slate-600 hover:bg-slate-800 hover:text-white font-medium transition-all shadow-sm border border-slate-200 hover:border-slate-800"
                >
                  <div className="flex items-center">
                    <UserCircle className="w-4 h-4 mr-3 text-slate-400 group-hover:text-slate-300 transition-colors" />
                    <span className="uppercase tracking-wider text-xs font-bold">Profile</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5">
            <button
              onClick={() => navigate('/dashboard')}
              className="group w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            
            {/* Invite Code - Minimal Design */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Invite Code
              </p>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                <span className="flex-1 font-mono text-sm font-bold text-slate-700">
                  {inviteCode || '---'}
                </span>
                <button 
                  onClick={() => {
                    if (inviteCode) {
                      navigator.clipboard.writeText(inviteCode);
                      toast.success('Copied!');
                    }
                  }}
                  className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isOwner && (
              <button 
                onClick={() => navigate(`/workspace/${workspaceId}/settings`)}
                className="group w-full flex items-center justify-center gap-2 py-2 px-4 bg-transparent hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors mt-1"
              >
                <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
                Workspace Settings
              </button>
            )}
          </div>

        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {children}
        </main>

      </div>

      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onClose={() => setIsCreateChannelModalOpen(false)}
        workspaceId={workspaceId || ''}
        onSuccess={(newChannel) => {
          const channelWithMembership = { ...newChannel, isMember: true };
          setChannels(prev => [...prev, channelWithMembership]);
          navigate(`/workspace/${workspaceId}/channels/${newChannel.id}`);
        }}
      />
    </div>
  );
};
