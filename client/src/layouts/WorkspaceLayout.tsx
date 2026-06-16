import { ReactNode, useState, useEffect } from 'react';
import {
  Search, Bell, HelpCircle, Settings, User as UserIcon,
  Hash, MessageSquare, BarChart2, Users, UserCircle,
  LogOut, Plus, ChevronDown, ArrowLeft, UserPlus
} from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { WorkspaceService } from '../api/workspace/workspace.service';
import { ChannelService } from '../api/workspace/channel.service';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [isOwner, setIsOwner] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);

  useEffect(() => {
    if (workspaceId) {
      ChannelService.getWorkspaceChannels(workspaceId)
        .then(res => setChannels(res.data?.data || []))
        .catch(err => console.error('Failed to fetch channels', err));
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId && user) {
      WorkspaceService.getWorkspaceMembers(workspaceId).then((response: any) => {
        const members = response.data || [];
        const currentMember = members.find((m: any) => m.userId === user.id);
        setIsOwner(currentMember?.role === 'owner');
      }).catch((err: any) => {
        if (err.response?.status === 403 || err.response?.status === 404) {
          toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Access Denied');
          navigate('/dashboard');
        } else {
          console.error('Failed to fetch workspace role', err);
        }
      });
    }
  }, [workspaceId, user]);

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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to leave workspace');
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

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl px-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search development workspace..."
              className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg pl-10 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
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
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                DC
              </div>
              <div>
                <h2 className="font-bold text-slate-900 leading-tight truncate text-lg">DevCollab</h2>
                <p className="text-xs text-slate-500">Enterprise Pro</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6 hide-scrollbar">

            {/* Channels Group */}
            <div>
              <div className="flex items-center justify-between text-slate-500 font-bold text-xs uppercase tracking-wider mb-2 px-2 hover:bg-slate-100 py-1 rounded cursor-pointer group transition-colors">
                <div className="flex items-center gap-1">
                  <ChevronDown className="w-3 h-3" /> Channels
                </div>
                <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100" />
              </div>
              <div className="space-y-1">
                <div className="text-slate-500 text-xs py-1.5 px-3 font-bold uppercase tracking-wider cursor-pointer hover:text-slate-700 rounded-md truncate transition-colors flex items-center">
                  <span className="mr-2">🔖</span> My Channels
                </div>
                {channels.map((channel: any) => (
                  <div
                    key={channel.id}
                    onClick={() => navigate(`/workspace/${workspaceId}/channels/${channel.id}`)}
                    className={`group flex items-center justify-between text-sm py-2 px-3 pl-6 rounded-xl cursor-pointer font-medium transition-all ${isActive(`channels/${channel.id}`) ? 'bg-blue-50/80 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'}`}
                  >
                    <div className="flex items-center truncate">
                      <Hash className={`w-4 h-4 mr-3 transition-colors ${isActive(`channels/${channel.id}`) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                      <span className="group-hover:translate-x-0.5 transition-transform">{channel.name}</span>
                    </div>
                    {isActive(`channels/${channel.id}`) && <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></div>}
                  </div>
                ))}
                
                {channels.length === 0 && (
                  <div className="text-slate-400 text-xs py-2 px-3 pl-6 italic">No channels yet</div>
                )}
              </div>
            </div>

            {/* Other Sections */}
            <div className="space-y-1.5">
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
            <button
              className="group w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
              Invite Members
            </button>
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
    </div>
  );
};
