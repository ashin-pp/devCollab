import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { WorkspaceLayout } from '../../../layouts/WorkspaceLayout';
import type { RootState } from '../../../store';
import { MessageSquare, Users, Hash, ShieldCheck, Lock, ArrowRight, BarChart3 } from 'lucide-react';
import { WorkspacePollsList } from '../../../components/polls/WorkspacePollsList';
import { useUserWorkspaces } from '../../../hooks/useWorkspaces';
import { useWorkspaceChannels } from '../../../hooks/useChannels';
import { WorkspaceService } from '../../../api/workspace/workspace.service';
import type { WorkspaceData, MemberData } from '../../../types/workspace.types';
import { getMemberAvatar, getMemberDisplayName, getMemberInitial } from '../../../utils/member.utils';

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
          const all = Array.isArray(res.data) ? res.data : res.data?.data || [];
          // Pending/invited are not workspace members yet.
          setMembers(
            all.filter(
              (m: MemberData) => m.status === 'approved' || m.status === 'blocked'
            )
          );
          setLoadingMembers(false);
        })
        .catch(() => {
          setLoadingMembers(false);
        });
    }
  }, [workspaceId]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <WorkspaceLayout>
      <div className="flex-1 min-h-0 h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="max-w-[1400px] mx-auto p-6 lg:p-8 space-y-6">

          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.12),_transparent_55%)]" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                  {workspaceName}
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                  Welcome back, {firstName}
                </h1>
                <p className="mt-2 max-w-xl text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                  {workspace?.description?.trim()
                    ? workspace.description
                    : 'Jump into channels, check in with your team, and vote on active polls.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 capitalize">
                    {workspace?.privacy === 'private' ? (
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Users className="h-3.5 w-3.5 text-blue-500" />
                    )}
                    {workspace?.privacy || 'public'} workspace
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 shrink-0">
                <button
                  onClick={() => navigate(`/workspace/${workspaceId}/channels`)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                >
                  <MessageSquare className="h-4 w-4" />
                  Open channels
                </button>
                <button
                  onClick={() => navigate(`/workspace/${workspaceId}/polls`)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <BarChart3 className="h-4 w-4 text-indigo-500" />
                  All polls
                </button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Channels',
                value: loadingChannels ? '—' : String(channels.length),
                icon: Hash,
                tint: 'bg-blue-50 text-blue-600',
                onClick: () => navigate(`/workspace/${workspaceId}/channels`),
              },
              {
                label: 'Members',
                value: loadingMembers ? '—' : String(members.length),
                icon: Users,
                tint: 'bg-emerald-50 text-emerald-600',
                onClick: () => navigate(`/workspace/${workspaceId}/members`),
              },
              {
                label: 'Team polls',
                value: 'Active',
                icon: BarChart3,
                tint: 'bg-indigo-50 text-indigo-600',
                onClick: () => navigate(`/workspace/${workspaceId}/polls`),
              },
            ].map((stat) => (
              <button
                key={stat.label}
                type="button"
                onClick={stat.onClick}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.tint}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-blue-500 group-hover:translate-x-0.5" />
              </button>
            ))}
          </section>

          {/* Main grid */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

            {/* Left column */}
            <div className="xl:col-span-7 space-y-6 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Channels */}
                <div className="flex flex-col rounded-2xl border border-slate-200/70 bg-white shadow-sm h-[380px] min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Hash className="h-4 w-4 text-slate-400 shrink-0" />
                      <h3 className="font-extrabold text-slate-900 truncate">Channels</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                        {channels.length}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/workspace/${workspaceId}/channels`)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      View all
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto p-2 custom-scrollbar">
                    {loadingChannels ? (
                      <div className="p-6 text-center text-sm text-slate-500">Loading channels...</div>
                    ) : channels.length > 0 ? (
                      channels.map((channel) => (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() => navigate(`/workspace/${workspaceId}/channels/${channel.id}`)}
                          className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 group"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                            {channel.privacy === 'private' ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Hash className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800">{channel.name}</p>
                            <p className="text-[11px] font-medium text-slate-500 capitalize">
                              {channel.privacy === 'private' ? 'Private' : 'Public'}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center text-sm text-slate-500">No channels yet.</div>
                    )}
                  </div>
                </div>

                {/* Members */}
                <div className="flex flex-col rounded-2xl border border-slate-200/70 bg-white shadow-sm h-[380px] min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Users className="h-4 w-4 text-slate-400 shrink-0" />
                      <h3 className="font-extrabold text-slate-900 truncate">Members</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                        {members.length}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/workspace/${workspaceId}/members`)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      View all
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto p-2 custom-scrollbar">
                    {loadingMembers ? (
                      <div className="p-6 text-center text-sm text-slate-500">Loading members...</div>
                    ) : members.length > 0 ? (
                      members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 rounded-xl p-3"
                        >
                          {getMemberAvatar(member) ? (
                            <img
                              src={getMemberAvatar(member)}
                              alt={getMemberDisplayName(member)}
                              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 ring-2 ring-white">
                              {getMemberInitial(member)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800">
                              {getMemberDisplayName(member)}
                            </p>
                            <p className="text-[11px] font-medium capitalize text-slate-500">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-sm text-slate-500">No members found.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Polls sidebar — fixed height + internal scroll */}
            <aside className="xl:col-span-5 min-w-0 xl:sticky xl:top-6">
              <WorkspacePollsList workspaceId={workspaceId as string} />
            </aside>
          </section>
        </div>
      </div>
    </WorkspaceLayout>
  );
};
