import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { WorkspaceLayout } from '../../../layouts/WorkspaceLayout';
import type { RootState } from '../../../store';
import { 
  CheckCircle2, 
  Clock, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  Users, 
  MessageSquare 
} from 'lucide-react';
import { WorkspacePollsList } from '../../../components/polls/WorkspacePollsList';
import { useUserWorkspaces } from '../../../hooks/useWorkspaces';
import type { WorkspaceData } from '../../../types/workspace.types';

export const WorkspaceDashboardPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const { workspaces, loading } = useUserWorkspaces();
  const workspace = workspaces.find((w: WorkspaceData) => w.id === workspaceId);
  const workspaceName = workspace?.name || 'Workspace';

  return (
    <WorkspaceLayout>
      <div className="flex-1 h-full overflow-y-auto bg-[#F8FAFC] p-8">
        
        {/* Header Section */}
        <div className="mb-10 flex items-end justify-between">
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

        {/* AI Insight Banner */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-[2px] mb-8 shadow-lg shadow-purple-500/10">
          <div className="bg-white rounded-[14px] p-6 flex gap-6 items-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg mb-1">AI Workspace Summary</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your team has been highly active in the <strong>#general</strong> channel today. There are <strong>3 new polls</strong> waiting for your vote, and <strong>2 pending member requests</strong> to review.
              </p>
            </div>
            <button className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-bold text-sm transition-colors">
              View Insights
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Weekly Activity</p>
                <div className="flex items-end gap-2">
                  <h4 className="text-2xl font-extrabold text-slate-900">84%</h4>
                  <span className="text-xs font-bold text-emerald-500 mb-1 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +12%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Time Saved</p>
                <div className="flex items-end gap-2">
                  <h4 className="text-2xl font-extrabold text-slate-900">12.5h</h4>
                  <span className="text-xs font-bold text-slate-500 mb-1">this month</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Active Members</p>
                <div className="flex items-end gap-2">
                  <h4 className="text-2xl font-extrabold text-slate-900">24</h4>
                  <span className="text-xs font-bold text-emerald-500 mb-1 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +3
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Tasks / To-Do */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-lg">Your Pending Tasks</h3>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="p-2 flex-1">
              <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group border-b border-slate-50 last:border-0">
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-blue-500 flex items-center justify-center transition-colors"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Review Frontend Pull Request</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Due today at 5:00 PM • assigned by Alex</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-orange-100 text-orange-700 text-xs font-bold">High Priority</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group border-b border-slate-50 last:border-0">
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-blue-500 flex items-center justify-center transition-colors"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Vote on New Architecture Poll</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Closes tomorrow • in #architecture</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold">Polls</span>
              </div>

              <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group border-b border-slate-50 last:border-0">
                <div className="w-6 h-6 rounded-full border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-500 line-through">Welcome new team members</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Completed 2 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Polls */}
          <div className="lg:col-span-3 mt-6">
            <WorkspacePollsList workspaceId={workspaceId as string} />
          </div>

        </div>
      </div>
    </WorkspaceLayout>
  );
};
