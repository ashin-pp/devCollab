import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { WorkspaceLayout } from '../../../layouts/WorkspaceLayout';
import type { RootState } from '../../../store';
import { MessageSquare, Users, Hash, Info, ShieldCheck, Lock } from 'lucide-react';
import { WorkspacePollsList } from '../../../components/polls/WorkspacePollsList';
import { useUserWorkspaces } from '../../../hooks/useWorkspaces';
import { useWorkspaceChannels } from '../../../hooks/useChannels';
import { WorkspaceService } from '../../../api/workspace/workspace.service';
import type { WorkspaceData, MemberData } from '../../../types/workspace.types';

export const WorkspaceDashboardPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const { workspaces } = useUserWorkspaces();
  const workspace = workspaces.find((w: WorkspaceData) => w.id === workspaceId);
  const workspaceName = workspace?.name || 'Workspace';

  const { channels, loading: loadingChannels } = useWorkspaceChannels(workspaceId);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    if (workspaceId) {
      WorkspaceService.getWorkspaceMembers(workspaceId, true)
        .then((res) => {
          setMembers(res.data || []);
          setLoadingMembers(false);
        })
        .catch(() => {
          setLoadingMembers(false);
        });
    }
  }, [workspaceId]);

  return (
    <WorkspaceLayout>
      <div className="flex-1 h-full overflow-y-auto bg-[#F8FAFC] p-8">
        
        {/* Header Section */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-slate-500 font-medium">
              Here is what's happening in <span className="font-bold text-slate-700">{workspaceName}</span> today.
            </p>
          </div>
          <button 
            onClick={() => navigate(`/workspace/${workspaceId}/channels`)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <MessageSquare className="w-4 h-4" />
            Go to Channels
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Workspace Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Workspace Info</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                  <p className="text-sm font-semibold text-slate-800">{workspace?.name}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Privacy</p>
                  <p className="text-sm font-semibold text-slate-800 capitalize flex items-center gap-1.5">
                    {workspace?.privacy === 'public' ? null : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                    {workspace?.privacy}
                  </p>
                </div>
                <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{workspace?.description || 'No description provided.'}</p>
                </div>
              </div>
            </div>

            {/* Channels & Members Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Channels List */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col h-[400px]">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-slate-400" />
                    <h3 className="font-extrabold text-slate-900">Channels ({channels.length})</h3>
                  </div>
                </div>
                <div className="p-2 flex-1 overflow-y-auto">
                  {loadingChannels ? (
                    <div className="p-4 text-sm text-slate-500 text-center">Loading channels...</div>
                  ) : channels.length > 0 ? (
                    channels.map(channel => (
                      <div 
                        key={channel.id} 
                        onClick={() => navigate(`/workspace/${workspaceId}/channels/${channel.id}`)}
                        className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                            {channel.privacy === 'private' ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Hash className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{channel.name}</p>
                            <p className="text-xs text-slate-500">{channel.privacy === 'private' ? 'Private' : 'Public'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-slate-500 text-center">No channels found.</div>
                  )}
                </div>
              </div>

              {/* Members List */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col h-[400px]">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-400" />
                    <h3 className="font-extrabold text-slate-900">Members ({members.length})</h3>
                  </div>
                </div>
                <div className="p-2 flex-1 overflow-y-auto">
                  {loadingMembers ? (
                    <div className="p-4 text-sm text-slate-500 text-center">Loading members...</div>
                  ) : members.length > 0 ? (
                    members.map(member => (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-default"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {member.user?.profileImage ? (
                            <img src={member.user.profileImage} alt={member.user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs shrink-0">
                              {member.user?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{member.user?.name}</p>
                            <p className="text-[11px] font-medium text-slate-500 capitalize">{member.role}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-slate-500 text-center">No members found.</div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Right Sidebar (Polls) */}
          <div className="lg:col-span-1">
            <WorkspacePollsList workspaceId={workspaceId as string} />
          </div>

        </div>
      </div>
    </WorkspaceLayout>
  );
};
