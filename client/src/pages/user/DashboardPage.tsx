import {
  Building2,
  Users, ArrowRight, KeyRound, PlusCircle, TerminalSquare, Globe, Lock, Copy, Search, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../store';
import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

import { UserLayout } from '../../layouts/UserLayout';
import { CreateWorkspaceModal } from '../../components/workspace/CreateWorkspaceModal';
import { WorkspaceService } from '../../api/workspace/workspace.service';
import type { Workspace } from '../../types/workspace.types';

export const DashboardPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [verificationResult, setVerificationResult] = useState<Record<string, unknown> | null>(null);
  const [verifyError, setVerifyError] = useState('');
  const [joinMessage, setJoinMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [myWorkspaces, setMyWorkspaces] = useState<Workspace[]>([]);
  const [publicWorkspaces, setPublicWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [publicCurrentPage, setPublicCurrentPage] = useState(1);

  useEffect(() => {
    setPublicCurrentPage(1);
  }, [searchQuery]);

  const unjoinedPublicWorkspaces = publicWorkspaces.filter(
    publicWs =>
      !myWorkspaces.some(myWs => myWs.id === publicWs.id) &&
      publicWs.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const myCreatedWorkspaces = myWorkspaces.filter(ws => ws.createdBy === user?.id);
  const myJoinedWorkspaces = myWorkspaces.filter(ws => ws.createdBy !== user?.id);

  const myCreatedChunks = chunkArray(myCreatedWorkspaces, 4);
  const myJoinedChunks = chunkArray(myJoinedWorkspaces, 4);

  const myCreatedWorkspacesRef = useRef<HTMLDivElement>(null);
  const myJoinedWorkspacesRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const [myRes, publicRes] = await Promise.all([
          WorkspaceService.getUserWorkspaces(),
          WorkspaceService.getPublicWorkspaces()
        ]);
        setMyWorkspaces(myRes.data || []);
        setPublicWorkspaces(publicRes.data || []);
      } catch (error) {
        console.error("Error fetching workspaces", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('inviteCode');
    if (code && !inviteCode) {
      setInviteCode(code);
      handleVerifyCodeFromQuery(code);
    }
  }, [location.search]);

  const handleVerifyCodeFromQuery = async (code: string) => {
    setVerifyError('');
    setIsJoining(true);
    try {
      const response = await WorkspaceService.verifyInviteCode(code);
      setVerificationResult(response.data);

      // Check if already a member (e.g., auto-added via email invite)
      const myRes = await WorkspaceService.getUserWorkspaces();
      const workspaces = myRes.data || [];
      setMyWorkspaces(workspaces);

      const isMember = workspaces.some((ws: Workspace) => ws.id === response.data.id);
      if (isMember) {
        setInviteCode('');
        setVerificationResult(null);
        navigate(`/workspace/${response.data.id}/dashboard`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setVerifyError(err.response?.data?.message || 'Invalid invite code');
    } finally {
      setIsJoining(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!inviteCode.trim()) {
      setVerifyError('Please enter a workspace invite code');
      return;
    }

    setVerifyError('');
    setIsJoining(true);
    try {
      const response = await WorkspaceService.verifyInviteCode(inviteCode);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setVerificationResult(response.data);
    } catch (error: unknown) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const err = error as { response?: { data?: { message?: string } } };
      setVerifyError(err.response?.data?.message || 'Invalid invite code');
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinWorkspace = async () => {
    setIsJoining(true);
    try {
      const response = await WorkspaceService.joinWorkspace({ inviteCode });

      if (response.data?.status === 'pending') {
        setJoinMessage({ type: 'success', text: 'Join request sent to private workspace! Waiting for owner approval.' });
        setTimeout(() => setJoinMessage(null), 5000);
      } else {
        setJoinMessage({ type: 'success', text: 'Successfully joined the workspace!' });
        setTimeout(() => {
          setJoinMessage(null);
          navigate(`/workspace/${response.data.workspaceId}/dashboard`);
        }, 1000);
      }
      setInviteCode('');
      setVerificationResult(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setJoinMessage({ type: 'error', text: err.response?.data?.message || 'Failed to join workspace' });
      setTimeout(() => setJoinMessage(null), 5000);
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinPublicWorkspace = async (code: string) => {
    setIsJoining(true);
    try {
      const response = await WorkspaceService.joinWorkspace({ inviteCode: code });
      Swal.fire('Success', 'Successfully joined the public workspace!', 'success');
      navigate(`/workspace/${response.data?.workspaceId || 'error'}/dashboard`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire('Error', err.response?.data?.message || 'Failed to join workspace', 'error');
    } finally {
      setIsJoining(false);
    }
  };

  const handleWorkspaceCreated = (workspace: Record<string, unknown>) => {
    setMyWorkspaces(prev => [...prev, workspace as unknown as Workspace]);
  };

  return (
    <UserLayout>
      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Engineer'}
          </h1>
          <p className="text-slate-500 font-medium">
            Select a workspace to continue your development workflow.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50/80 to-transparent rounded-bl-full -z-10 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-900">My Workspaces</h2>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {myCreatedWorkspaces.length} ACTIVE
                  </span>
                </div>
                {myCreatedChunks.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => scrollContainer(myCreatedWorkspacesRef, 'left')} className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => scrollContainer(myCreatedWorkspacesRef, 'right')} className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : myCreatedWorkspaces.length > 0 ? (
                <div ref={myCreatedWorkspacesRef} className="flex overflow-x-auto snap-x snap-mandatory pb-6 hide-scrollbar scroll-smooth">
                  {myCreatedChunks.map((chunk, index) => (
                    <div key={index} className="w-full min-w-full shrink-0 snap-start">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[750px] pr-6 md:pr-0">
                        {chunk.map(workspace => (
                        <div key={workspace.id} className="w-full bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group flex flex-col h-auto min-h-[260px]">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                          <div className="absolute top-4 right-4 text-slate-100 group-hover:text-blue-50 transition-colors duration-500 z-0">
                            <TerminalSquare className="w-16 h-16 opacity-50 transform rotate-12 group-hover:rotate-6 transition-transform duration-500" />
                          </div>
                          {workspace.logo ? (
                            <img src={workspace.logo} alt={workspace.name} className="w-12 h-12 rounded-xl object-cover mb-4 relative z-10 shadow-sm border border-slate-100" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center mb-4 relative z-10 shadow-inner">
                              <Building2 className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-2 relative z-10">
                            <h3 className="text-xl font-bold text-slate-900 truncate">{workspace.name}</h3>
                            {workspace.privacy === 'public' ? (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase shrink-0">
                                <Globe className="w-3 h-3" /> Public
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase shrink-0">
                                <Lock className="w-3 h-3" /> Private
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mb-6 relative z-10 flex-1 line-clamp-2">
                            {workspace.description || 'No description provided.'}
                          </p>
                          <div className="flex flex-col mt-auto pt-4 border-t border-slate-100 relative z-10 gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Users className="w-4 h-4" />
                                {workspace.maxMembers} Limit
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Code:</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(workspace.inviteCode || '');
                                    Swal.fire({ title: 'Copied!', text: 'Invite code copied to clipboard', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                                  }}
                                  className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-mono font-semibold transition-colors border border-slate-200"
                                  title="Copy Invite Code"
                                >
                                  {workspace.inviteCode || 'N/A'} <Copy className="w-3 h-3 ml-1" />
                                </button>
                              </div>
                            </div>
                            {workspace.isActive === false ? (
                              <button disabled className="flex items-center justify-center gap-1 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold w-full cursor-not-allowed opacity-80">
                                Deactivated by admin
                              </button>
                            ) : workspace.memberStatus === 'blocked' ? (
                              <button disabled className="flex items-center justify-center gap-1 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold w-full cursor-not-allowed opacity-80">
                                Blocked by admin
                              </button>
                            ) : (
                              <button onClick={() => navigate(`/workspace/${workspace.id}/dashboard`)} className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm w-full">
                                Launch Workspace <ArrowRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                  <p className="text-slate-500 mb-4">You haven't created any workspaces yet.</p>
                  <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                    Create One
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-50/80 to-transparent rounded-bl-full -z-10 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-900">Joined Workspaces</h2>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {myJoinedWorkspaces.length} JOINED
                  </span>
                </div>
                {myJoinedChunks.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => scrollContainer(myJoinedWorkspacesRef, 'left')} className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => scrollContainer(myJoinedWorkspacesRef, 'right')} className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : myJoinedWorkspaces.length > 0 ? (
                <div ref={myJoinedWorkspacesRef} className="flex overflow-x-auto snap-x snap-mandatory pb-6 hide-scrollbar scroll-smooth">
                  {myJoinedChunks.map((chunk, index) => (
                    <div key={index} className="w-full min-w-full shrink-0 snap-start">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[750px] pr-6 md:pr-0">
                        {chunk.map(workspace => (
                        <div key={workspace.id} className="w-full bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group flex flex-col h-auto min-h-[260px]">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                          <div className="absolute top-4 right-4 text-slate-100 group-hover:text-emerald-50 transition-colors duration-500 z-0">
                            <TerminalSquare className="w-16 h-16 opacity-50 transform rotate-12 group-hover:rotate-6 transition-transform duration-500" />
                          </div>
                          {workspace.logo ? (
                            <img src={workspace.logo} alt={workspace.name} className="w-12 h-12 rounded-xl object-cover mb-4 relative z-10 shadow-sm border border-slate-100" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 flex items-center justify-center mb-4 relative z-10 shadow-inner">
                              <Building2 className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-2 relative z-10">
                            <h3 className="text-xl font-bold text-slate-900 truncate">{workspace.name}</h3>
                            {workspace.privacy === 'public' ? (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase shrink-0">
                                <Globe className="w-3 h-3" /> Public
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase shrink-0">
                                <Lock className="w-3 h-3" /> Private
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mb-6 relative z-10 flex-1 line-clamp-2">
                            {workspace.description || 'No description provided.'}
                          </p>
                          <div className="flex flex-col mt-auto pt-4 border-t border-slate-100 relative z-10 gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Users className="w-4 h-4" />
                                {workspace.maxMembers} Limit
                              </div>
                            </div>
                            {workspace.isActive === false ? (
                              <button disabled className="flex items-center justify-center gap-1 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold w-full cursor-not-allowed opacity-80">
                                Deactivated by admin
                              </button>
                            ) : workspace.memberStatus === 'blocked' ? (
                              <button disabled className="flex items-center justify-center gap-1 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold w-full cursor-not-allowed opacity-80">
                                Blocked by admin
                              </button>
                            ) : (
                              <button onClick={() => navigate(`/workspace/${workspace.id}/dashboard`)} className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm w-full">
                                Launch Workspace <ArrowRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                  <p className="text-slate-500">You haven't joined any external workspaces yet.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-50/80 to-transparent rounded-bl-full -z-10 pointer-events-none"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Public Workspaces</h2>
                    <p className="text-xs text-slate-500 mt-1">Discover and instantly join open teams.</p>
                  </div>
                </div>
                <div className="relative group w-full sm:w-auto">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search open workspaces..."
                    className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-sm w-full sm:w-72 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : unjoinedPublicWorkspaces.length > 0 ? (
                <div className="relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[750px]">
                    {unjoinedPublicWorkspaces.slice((publicCurrentPage - 1) * 4, publicCurrentPage * 4).map(workspace => (
                      <div key={workspace.id} className="w-full bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group flex flex-col h-auto min-h-[260px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-red-50 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                        {workspace.logo ? (
                          <img src={workspace.logo} alt={workspace.name} className="w-12 h-12 rounded-xl object-cover mb-4 relative z-10 shadow-sm border border-slate-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 flex items-center justify-center mb-4 relative z-10 shadow-inner">
                            <Users className="w-6 h-6" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                          <h3 className="text-xl font-bold text-slate-900 truncate">{workspace.name}</h3>
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase shrink-0">
                            <Globe className="w-3 h-3" /> Public
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-6 relative z-10 flex-1 line-clamp-2">
                          {workspace.description || 'No description provided.'}
                        </p>
                        <div className="flex flex-col mt-auto pt-4 border-t border-slate-100 relative z-10 gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Code:</span>
                            <span className="bg-slate-50 text-slate-700 px-2 py-1 rounded text-xs font-mono font-semibold border border-slate-200">
                              {workspace.inviteCode || 'N/A'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleJoinPublicWorkspace(workspace.inviteCode)}
                            disabled={isJoining}
                            className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm w-full disabled:opacity-50"
                          >
                            Join Instantly <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {Math.ceil(unjoinedPublicWorkspaces.length / 4) > 1 && (
                    <div className="mt-8 flex items-center gap-4">
                      <button
                        onClick={() => setPublicCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={publicCurrentPage === 1}
                        className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                        Page {publicCurrentPage} of {Math.ceil(unjoinedPublicWorkspaces.length / 4)}
                      </span>
                      <button
                        onClick={() => setPublicCurrentPage(prev => Math.min(Math.ceil(unjoinedPublicWorkspaces.length / 4), prev + 1))}
                        disabled={publicCurrentPage === Math.ceil(unjoinedPublicWorkspaces.length / 4)}
                        className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                  <p className="text-slate-500">No public workspaces available.</p>
                </div>
              )}
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white mt-8 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 z-0"></div>
              <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-500/10 blur-[80px] z-0 pointer-events-none"></div>

              <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center min-h-[280px]">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 max-w-lg leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Elevate your team's development experience.
                </h2>
                <p className="text-slate-300 max-w-md leading-relaxed">
                  Built for high-performance engineering teams requiring precision and reliability.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded text-sm font-semibold transition-colors">
                membership plan
              </button>
            </div>

          </div>

          <div className="w-full lg:w-80 shrink-0 space-y-6">

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-blue-600">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Join a Workspace</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Access an existing workspace using a unique invitation code.
              </p>

              <div className="space-y-4">
                {!verificationResult ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Enter Workspace Code
                      </label>
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => { setInviteCode(e.target.value); setVerifyError(''); }}
                        placeholder="e.g. DC-123-XYZ"
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${verifyError ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-300'}`}
                      />
                      {verifyError && (
                        <p className="mt-1.5 text-xs text-red-500 font-medium">{verifyError}</p>
                      )}
                    </div>
                    <button
                      onClick={handleVerifyCode}
                      disabled={isJoining}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isJoining ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </>
                ) : (
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-slate-900">{verificationResult.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">{verificationResult.description || 'No description'}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setVerificationResult(null); setInviteCode(''); }}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        {myWorkspaces.some(ws => ws.id === verificationResult.id) ? 'Close' : 'Cancel'}
                      </button>
                      {myWorkspaces.some(ws => ws.id === verificationResult.id) ? (
                        <button
                          onClick={() => navigate(`/workspace/${verificationResult.id}/dashboard`)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1"
                        >
                          Already Member
                        </button>
                      ) : (
                        <button
                          onClick={handleJoinWorkspace}
                          disabled={isJoining}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                        >
                          {isJoining ? 'Processing...' : verificationResult.privacy === 'private' ? 'Send Request' : 'Join Now'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {joinMessage && (
                  <div className={`mt-4 p-3 rounded-lg text-sm font-semibold flex items-center justify-center transition-all animate-in fade-in slide-in-from-top-2 ${
                    joinMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                  }`}>
                    {joinMessage.text}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-slate-200 border-dashed rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-blue-600">
                <PlusCircle className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Create New Workspace</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Set up a new space for your team. Includes dedicated repositories, shared CI/CD, and workspace-wide secrets.
              </p>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                Create Workspace
              </button>
            </div>

          </div>
        </div>
      </main>

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleWorkspaceCreated}
      />
    </UserLayout>
  );
};
