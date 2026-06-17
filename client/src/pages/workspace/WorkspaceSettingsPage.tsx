import { WorkspaceLayout } from '../../layouts/WorkspaceLayout';
import { Settings, Users, Hash, BarChart3, AlertCircle, Download, Copy, RefreshCw, Trash2, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { WorkspaceService } from '../../api/workspace/workspace.service';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

import type { WorkspaceData, MemberData } from '../../types/workspace.types';

export const WorkspaceSettingsPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [maxMembers, setMaxMembers] = useState<number | ''>(50);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  async function fetchData() {
    if (!workspaceId) return;
    try {
      setIsLoading(true);
      const response = await WorkspaceService.getUserWorkspaces();
      const ws = response.data.find((w: WorkspaceData) => w.id === workspaceId);
      if (ws) {
        setWorkspace(ws);
        setName(ws.name);
        setDescription(ws.description || '');
        setPrivacy(ws.privacy);
        if (ws.maxMembers) setMaxMembers(ws.maxMembers);
      }

      const membersData = await WorkspaceService.getWorkspaceMembers(workspaceId, false);
      setMembers(membersData.data);
    } catch {
      toast.error('Failed to load workspace data');
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner = workspace?.createdBy === currentUser?.id || members.some(m => m.userId === currentUser?.id && m.role === 'owner');

  const handleUpdateGeneral = async () => {
    if (!workspaceId) return;
    try {
      const loadingToast = toast.loading('Updating settings...');
      const membersLimit = maxMembers === '' ? 50 : maxMembers;
      await WorkspaceService.updateWorkspace(workspaceId, { name, description, privacy, maxMembers: membersLimit });
      toast.dismiss(loadingToast);
      toast.success('Settings updated successfully!');
      fetchData();
    } catch (error: unknown) {
      toast.dismiss();
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update settings');
    }
  };

  const handleRegenerateCode = async () => {
    if (!workspaceId) return;
    Swal.fire({
      title: 'Regenerate Code?',
      text: 'The old invite code will no longer work.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Regenerate',
      confirmButtonColor: '#2563eb'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await WorkspaceService.regenerateInviteCode(workspaceId);
          toast.success('Invite code regenerated!');
          fetchData();
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || 'Failed to regenerate code');
        }
      }
    });
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceId) return;
    Swal.fire({
      title: 'Delete Workspace?',
      text: 'This action is irreversible and will remove all members and data.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#dc2626'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await WorkspaceService.deleteWorkspace(workspaceId);
          toast.success('Workspace deleted!');
          navigate('/dashboard');
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || 'Failed to delete workspace');
        }
      }
    });
  };

  if (isLoading) {
    return (
      <WorkspaceLayout>
        <div className="flex h-full items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </WorkspaceLayout>
    );
  }

  if (!workspace) {
    return (
      <WorkspaceLayout>
        <div className="p-8 text-center text-slate-500">Workspace not found.</div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      <div className="h-full overflow-y-auto bg-slate-50 p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex items-start justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">Workspace Settings</h1>
                {isOwner && (
                  <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-orange-200">
                    Ownership Only
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm">Manage your organization's members, channels, and security settings.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors shadow-sm">
                <Download className="w-4 h-4" /> Export Data
              </button>
              <button onClick={handleUpdateGeneral} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                <Settings className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Users className="w-16 h-16 text-blue-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Members</p>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{members.length}</h3>
              <p className="text-xs text-emerald-600 font-semibold">+12% <span className="text-slate-400 font-normal">vs last month</span></p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Users className="w-16 h-16 text-emerald-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active Members</p>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{Math.max(1, Math.floor(members.length * 0.8))}</h3>
              <p className="text-xs text-orange-600 font-semibold">73.4% <span className="text-slate-400 font-normal">engagement rate</span></p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Hash className="w-16 h-16 text-purple-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Channels</p>
              <h3 className="text-3xl font-black text-slate-900 mb-1">12</h3>
              <p className="text-xs text-slate-500">2 <span className="text-slate-400">created this week</span></p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-16 h-16 text-indigo-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Message Volume</p>
              <h3 className="text-3xl font-black text-slate-900 mb-1">4.2k</h3>
              <p className="text-xs text-emerald-600 font-semibold">+5.2% <span className="text-slate-400 font-normal">from yesterday</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="col-span-2 space-y-8">
              
              {isOwner && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900">General Information</h2>
                    <p className="text-sm text-slate-500 mt-1">Update your workspace identity and privacy.</p>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Workspace Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Privacy Setting</label>
                      <div className="flex gap-4">
                        <label className={`flex-1 flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${privacy === 'public' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                          <div>
                            <p className={`font-bold text-sm ${privacy === 'public' ? 'text-blue-900' : 'text-slate-700'}`}>Public Workspace</p>
                            <p className="text-xs text-slate-500 mt-0.5">Anyone can join without approval.</p>
                          </div>
                          <input type="radio" name="privacy" value="public" checked={privacy === 'public'} onChange={() => setPrivacy('public')} className="w-4 h-4 text-blue-600" />
                        </label>
                        <label className={`flex-1 flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${privacy === 'private' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                          <div>
                            <p className={`font-bold text-sm ${privacy === 'private' ? 'text-blue-900' : 'text-slate-700'}`}>Private Workspace</p>
                            <p className="text-xs text-slate-500 mt-0.5">Requires owner approval to join.</p>
                          </div>
                          <input type="radio" name="privacy" value="private" checked={privacy === 'private'} onChange={() => setPrivacy('private')} className="w-4 h-4 text-blue-600" />
                        </label>
                      </div>
                    </div>
                    <div className="pt-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Max Members Size</label>
                      <input 
                        type="number" 
                        value={maxMembers}
                        onChange={(e) => setMaxMembers(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="1"
                      />
                    </div>
                    <div className="pt-2">
                      <button onClick={handleUpdateGeneral} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Manage Channels</h2>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
                    + Create New Channel
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors"># engineering</h3>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded">Public</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">The main hub for all engineering related discussions, sprint planning, and technical alignment.</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>24 members</span>
                      <Settings className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors"># general</h3>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded">Public</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">Company-wide announcements and social interactions for the entire DevCollab team.</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{members.length} members</span>
                      <Settings className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="space-y-8">
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="text-lg font-bold text-slate-900">Security & Access</h2>
                </div>
                <div className="p-6 space-y-6">
                  
                  {isOwner && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Invite Code</label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 font-mono text-sm font-bold px-3 py-2 rounded-lg flex items-center justify-center">
                          {workspace.inviteCode}
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(workspace.inviteCode);
                            toast.success('Copied to clipboard');
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={handleRegenerateCode} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 mt-2">
                        <RefreshCw className="w-3 h-3" /> Regenerate Code
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Danger Zone</label>
                    
                    {!isOwner && (
                      <button className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-colors border border-red-100 group">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Leave Workspace
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    )}

                    {isOwner && (
                      <button onClick={handleDeleteWorkspace} className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-colors border border-red-100 group">
                        <div className="flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Delete Workspace
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    )}
                  </div>

                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                </div>
                <div className="p-6">
                  <div className="relative border-l-2 border-slate-100 pl-4 space-y-6 ml-2">
                    <div className="relative">
                      <div className="absolute -left-[25px] bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white">
                        <Users className="w-3 h-3" />
                      </div>
                      <p className="text-sm text-slate-900 font-medium">Jordan Miller joined the workspace.</p>
                      <p className="text-xs text-slate-400 mt-0.5">2 minutes ago</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[25px] bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white">
                        <Hash className="w-3 h-3" />
                      </div>
                      <p className="text-sm text-slate-900 font-medium">Alex Linden created channel <span className="text-blue-600 font-bold">#q4-planning</span>.</p>
                      <p className="text-xs text-slate-400 mt-0.5">45 minutes ago</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[25px] bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white">
                        <AlertCircle className="w-3 h-3" />
                      </div>
                      <p className="text-sm text-slate-900 font-medium">Workspace security policy updated.</p>
                      <p className="text-xs text-slate-400 mt-0.5">5 hours ago</p>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors">
                    View Activity Log
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </WorkspaceLayout>
  );
};
