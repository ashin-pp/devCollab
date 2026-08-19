import { WorkspaceLayout } from '../../../layouts/WorkspaceLayout';
import { Settings, Users, Hash, AlertCircle, Download, Copy, RefreshCw, Trash2, ArrowRight, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { WorkspaceService } from '../../../api/workspace/workspace.service';
import { ChannelService } from '../../../api/workspace/channel.service';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

import type { WorkspaceData, MemberData } from '../../../types/workspace.types';
import { validateWorkspaceTeamSize } from '../../../validation';
import { resolveUserPlan } from '../../../utils/plan-limits.utils';

export const WorkspaceSettingsPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [channelCount, setChannelCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [maxMembers, setMaxMembers] = useState<number | ''>(50);
  const [planMemberLimit, setPlanMemberLimit] = useState<number | null>(null);
  const [maxMembersError, setMaxMembersError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  async function fetchData() {
    if (!workspaceId) return;
    try {
      setIsLoading(true);
      const [response, plan] = await Promise.all([
        WorkspaceService.getUserWorkspaces(),
        resolveUserPlan(),
      ]);
      setPlanMemberLimit(plan?.maxMembersPerWorkspace ?? null);

      const ws = response.data.find((w: WorkspaceData) => w.id === workspaceId);
      if (ws) {
        setWorkspace(ws);
        setName(ws.name);
        setDescription(ws.description || '');
        setLogo(ws.logo || '');
        setPrivacy(ws.privacy);
        if (ws.maxMembers) setMaxMembers(ws.maxMembers);
      }

      const membersData = await WorkspaceService.getWorkspaceMembers(workspaceId, false);
      const loadedMembers: MemberData[] = Array.isArray(membersData.data)
        ? membersData.data
        : membersData.data?.data || [];
      setMembers(loadedMembers);

      if (ws?.maxMembers) {
        const approvedCount = loadedMembers.filter((m) => m.status === 'approved').length;
        setMaxMembersError(
          validateWorkspaceTeamSize(String(ws.maxMembers), {
            maxAllowed: plan?.maxMembersPerWorkspace,
            minAllowed: approvedCount || 1,
          })
        );
      } else {
        setMaxMembersError(null);
      }

      const channelsData = await ChannelService.getWorkspaceChannels(workspaceId);
      setChannels(channelsData.data?.data || []);
      setChannelCount(channelsData.data?.data?.length || 0);
    } catch {
      toast.error('Failed to load workspace data');
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner = workspace?.createdBy === currentUser?.id || members.some(m => m.userId === currentUser?.id && m.role === 'owner');
  const approvedMemberCount = members.filter((m) => m.status === 'approved').length;

  const handleMaxMembersChange = (value: string) => {
    if (value === '') {
      setMaxMembers('');
      setMaxMembersError(null);
      return;
    }
    const next = Number(value);
    setMaxMembers(next);
    setMaxMembersError(
      validateWorkspaceTeamSize(value, {
        maxAllowed: planMemberLimit ?? undefined,
        minAllowed: approvedMemberCount || 1,
      })
    );
  };

  const handleUpdateGeneral = async () => {
    if (!workspaceId) return;

    if (maxMembers === '') {
      toast.error('Max members is required');
      return;
    }

    const sizeError = validateWorkspaceTeamSize(String(maxMembers), {
      maxAllowed: planMemberLimit ?? undefined,
      minAllowed: approvedMemberCount || 1,
    });
    if (sizeError) {
      setMaxMembersError(sizeError);
      toast.error(sizeError);
      return;
    }

    try {
      const loadingToast = toast.loading('Updating settings...');
      await WorkspaceService.updateWorkspace(workspaceId, {
        name,
        description,
        logo,
        privacy,
        maxMembers,
      });
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

  const handleToggleChannelStatus = async (channelId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!workspaceId) return;

    if (currentStatus) {
      const result = await Swal.fire({
        title: 'Block Channel?',
        text: 'Are you sure you want to block this channel?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Block',
        confirmButtonColor: '#ea580c'
      });
      if (!result.isConfirmed) return;
    }

    try {
      const loadingToast = toast.loading(currentStatus ? 'Blocking channel...' : 'Unblocking channel...');
      await ChannelService.updateChannel(workspaceId, channelId, { is_active: !currentStatus });
      toast.dismiss(loadingToast);
      toast.success(`Channel ${currentStatus ? 'blocked' : 'unblocked'} successfully!`);
      fetchData();
    } catch (error: unknown) {
      toast.dismiss();
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update channel status');
    }
  };

  const handleDeleteChannel = async (channelId: string, channelName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!workspaceId) return;
    Swal.fire({
      title: `Delete #${channelName}?`,
      text: 'This action is irreversible and will remove all messages in this channel.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#dc2626'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await ChannelService.deleteChannel(workspaceId, channelId);
          toast.success('Channel deleted!');
          fetchData();
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || 'Failed to delete channel');
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Users className="w-16 h-16 text-blue-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Members</p>
              <h3 className="text-3xl font-black text-slate-900">{members.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Hash className="w-16 h-16 text-purple-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Channels</p>
              <h3 className="text-3xl font-black text-slate-900">{channelCount}</h3>
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
                    <div className="flex items-center gap-6 mb-4">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {logo ? (
                            <img src={logo} alt="Workspace Logo" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-2xl font-bold text-slate-400">{name ? name.charAt(0).toUpperCase() : 'W'}</div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer text-white flex flex-col items-center">
                              <Upload className="w-5 h-5 mb-1" />
                              <span className="text-[10px] font-bold">Change</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setIsUploadingLogo(true);
                                    const formData = new FormData();
                                    formData.append('image', file);
                                    try {
                                      const { api } = await import('../../../api/axios');
                                      const res = await api.post('/upload/image', formData, {
                                        headers: { 'Content-Type': 'multipart/form-data' }
                                      });
                                      setLogo(res.data.data.imageUrl);
                                      toast.success('Logo uploaded successfully');
                                    } catch (err) {
                                      toast.error('Failed to upload logo');
                                    } finally {
                                      setIsUploadingLogo(false);
                                    }
                                  }
                                }}
                                disabled={isUploadingLogo}
                              />
                            </label>
                          </div>
                        </div>
                        {isUploadingLogo && (
                          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Workspace Logo</h3>
                        <p className="text-xs text-slate-500 mt-1">Upload a square image. Recommended size is 256x256px.</p>
                      </div>
                    </div>
                    
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
                        onChange={(e) => handleMaxMembersChange(e.target.value)}
                        className={`w-full bg-slate-50 border text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          maxMembersError ? 'border-rose-400' : 'border-slate-200'
                        }`}
                        min={approvedMemberCount || 1}
                        max={planMemberLimit ?? undefined}
                        placeholder={
                          planMemberLimit
                            ? `Max ${planMemberLimit} on your plan`
                            : undefined
                        }
                      />
                      {maxMembersError ? (
                        <p className="mt-1.5 text-xs font-medium text-rose-600">{maxMembersError}</p>
                      ) : (
                        <p className="mt-1.5 text-xs text-slate-500">
                          {planMemberLimit
                            ? `Your plan allows up to ${planMemberLimit} members.`
                            : 'Set the maximum members for this workspace.'}
                          {approvedMemberCount > 0
                            ? ` Current members: ${approvedMemberCount}.`
                            : ''}
                        </p>
                      )}
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={handleUpdateGeneral}
                        disabled={!!maxMembersError}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                      >
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
                  {channels.map(channel => (
                    <div key={channel.id} onClick={() => navigate(`/workspace/${workspaceId}/channels/${channel.id}`)} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors cursor-pointer group flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-bold transition-colors ${!channel.isActive ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-blue-600'}`}># {channel.name}</h3>
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded">
                            {channel.privacy}
                          </span>
                          {!channel.isActive && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold uppercase rounded">
                              Blocked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                          {channel.description || 'No description provided.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-end text-xs text-slate-400 gap-2">
                        {isOwner && (
                          <>
                            <button 
                              onClick={(e) => handleToggleChannelStatus(channel.id, channel.isActive, e)}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${channel.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                            >
                              {channel.isActive ? 'Block' : 'Unblock'}
                            </button>
                            <button 
                              onClick={(e) => handleDeleteChannel(channel.id, channel.name, e)}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {channels.length === 0 && (
                    <div className="col-span-1 sm:col-span-2 text-center py-6 text-slate-400 text-sm">
                      No channels found in this workspace.
                    </div>
                  )}
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
                            navigator.clipboard.writeText(workspace.inviteCode ?? '');
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

            </div>
          </div>

        </div>
      </div>
    </WorkspaceLayout>
  );
};
