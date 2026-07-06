import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { WorkspaceLayout } from '../../../layouts/WorkspaceLayout';
import { fetchWorkspacePolls, votePoll, closePollThunk, addPoll, updatePoll, removePoll } from '../../../store/slices/pollSlice';
import { WorkspaceService } from '../../../api/workspace/workspace.service';
import { useSocket } from '../../../hooks/useSocket';
import type { AppDispatch, RootState } from '../../../store';
import { CreatePollModal } from '../../../components/polls/CreatePollModal';
import { VotedMembersModal } from '../../../components/polls/VotedMembersModal';
import { 
  BarChart2, 
  Plus, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Bell,
  Lock,
  Hash
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export const WorkspacePollsPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const socket = useSocket(workspaceId);
  
  const { polls } = useSelector((state: RootState) => state.polls);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [members, setMembers] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'participated' | 'closed'>('all');
  const [now, setNow] = useState(Date.now());
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [selectedPollForVoters, setSelectedPollForVoters] = useState<string | null>(null);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspacePolls(workspaceId));
      
      // Fetch members locally since there is no workspaceSlice
      WorkspaceService.getWorkspaceMembers(workspaceId, false)
        .then(res => setMembers(Array.isArray(res.data) ? res.data : res.data?.data || []))
        .catch(err => console.error('Failed to fetch members', err));
    }
    
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch, workspaceId]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket || !workspaceId) return;

    socket.emit('join_workspace', workspaceId);

    const handleNewPoll = (poll: any) => {
      if (poll.workspaceId === workspaceId && !poll.channelId) {
        dispatch(addPoll(poll));
      }
    };

    const handlePollUpdated = (poll: any) => {
      if (poll.workspaceId === workspaceId && !poll.channelId) {
        dispatch(updatePoll(poll));
      }
    };

    const handlePollDeleted = (pollId: string) => {
      dispatch(removePoll(pollId));
    };

    socket.on('new_poll', handleNewPoll);
    socket.on('poll_updated', handlePollUpdated);
    socket.on('poll_voted', handlePollUpdated); // poll_voted is similar to updated
    socket.on('poll_deleted', handlePollDeleted);

    return () => {
      socket.off('new_poll', handleNewPoll);
      socket.off('poll_updated', handlePollUpdated);
      socket.off('poll_voted', handlePollUpdated);
      socket.off('poll_deleted', handlePollDeleted);
    };
  }, [socket, workspaceId, dispatch]);

  // Process polls
  const workspacePolls = polls.filter(p => p.workspaceId === workspaceId && !p.channelId);
  
  const activePolls = workspacePolls.filter(p => p.isActive && (!p.startsAt || new Date(p.startsAt).getTime() <= now) && (!p.expiresAt || new Date(p.expiresAt).getTime() > now));
  const closedPolls = workspacePolls.filter(p => !p.isActive || (p.expiresAt && new Date(p.expiresAt).getTime() <= now));

  // Sort active polls
  const sortedActivePolls = [...activePolls].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const carouselPoll = sortedActivePolls.length > 0 ? sortedActivePolls[currentCarouselIndex % sortedActivePolls.length] : null;

  useEffect(() => {
    if (sortedActivePolls.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCarouselIndex(prev => (prev + 1) % sortedActivePolls.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [sortedActivePolls.length]);

  const handlePrevPoll = () => {
    setCurrentCarouselIndex(prev => (prev === 0 ? sortedActivePolls.length - 1 : prev - 1));
  };

  const handleNextPoll = () => {
    setCurrentCarouselIndex(prev => (prev + 1) % sortedActivePolls.length);
  };

  // Helper to get user details
  const getUserDetails = (userId: string) => {
    return members.find(m => m.userId === userId)?.user || null;
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      await dispatch(votePoll({ pollId, optionId })).unwrap();
      toast.success('Vote recorded!');
    } catch (error: unknown) {
      const err = error as string | { message?: string };
      toast.error(typeof err === 'string' ? err : (err.message || 'Failed to vote'));
    }
  };

  const handleClosePoll = async (pollId: string) => {
    const result = await Swal.fire({
      title: 'Close Poll?',
      text: "Are you sure you want to close this poll? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, close it!'
    });

    if (!result.isConfirmed) {
      return;
    }
    
    try {
      await dispatch(closePollThunk(pollId)).unwrap();
      toast.success('Poll closed successfully');
    } catch (error: unknown) {
      const err = error as string | { message?: string };
      toast.error(typeof err === 'string' ? err : (err.message || 'Failed to close poll'));
    }
  };

  // Filter history based on tabs
  let historyPolls = workspacePolls.filter(p => !p.startsAt || new Date(p.startsAt).getTime() <= now);
  if (activeTab === 'participated') historyPolls = historyPolls.filter(p => p.options.some(o => o.votes.includes(user?.id || '')));
  if (activeTab === 'closed') historyPolls = closedPolls;

  const totalItems = historyPolls.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPolls = historyPolls.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <WorkspaceLayout>
      <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
        
        {/* Page Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800">Polls</h1>
        </div>

        {/* Main Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 hide-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Active Discussions</h1>
                <p className="text-sm text-slate-500 mt-1">Gather consensus and make team decisions faster with real-time feedback.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Create New Poll
              </button>
            </div>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Active Poll Card */}
              {/* Main Active Poll Card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-lg border border-slate-200/60 p-6 sm:p-8 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl group/card">
                {/* Modern subtle background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                
                {/* Gradient left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-600 to-indigo-600"></div>
                
                {carouselPoll ? (
                  <div className="relative z-10 w-full">
                    {/* Carousel Navigation Arrows */}
                    {sortedActivePolls.length > 1 && (
                      <>
                        <button 
                          onClick={handlePrevPoll} 
                          className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white/90 backdrop-blur-md shadow-md text-slate-700 hover:text-blue-600 rounded-full border border-slate-200/50 hover:border-blue-300 hover:scale-105 transition-all opacity-0 group-hover/card:opacity-100"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={handleNextPoll} 
                          className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white/90 backdrop-blur-md shadow-md text-slate-700 hover:text-blue-600 rounded-full border border-slate-200/50 hover:border-blue-300 hover:scale-105 transition-all opacity-0 group-hover/card:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    <div className="flex items-start sm:items-center justify-between mb-8 sm:px-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {getUserDetails(carouselPoll.createdBy)?.profileImage ? (
                          <img 
                            src={getUserDetails(carouselPoll.createdBy)?.profileImage} 
                            alt="Creator" 
                            className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 shadow-sm border border-slate-200/50">
                            {getUserDetails(carouselPoll.createdBy)?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-base text-slate-900">{getUserDetails(carouselPoll.createdBy)?.name || 'Unknown User'}</div>
                          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <span>{new Date(carouselPoll.startsAt || carouselPoll.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-blue-600 font-bold text-[10px] tracking-wide bg-blue-50 px-1.5 py-0.5 rounded animate-pulse">LIVE NOW</span>
                            {carouselPoll.expiresAt && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-slate-500 text-[10px] font-bold tracking-wide">
                                  ENDS {new Date(carouselPoll.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <h2 className="text-2xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight sm:px-4">
                      {carouselPoll.question}
                    </h2>

                    <div className="space-y-4 sm:px-4 mb-10">
                      {carouselPoll.options.map((option) => {
                        const totalVotes = carouselPoll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
                        const votesCount = option.votes.length;
                        const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
                        const isSelected = option.votes.includes(user?.id || '');

                        const voterNames = option.votes.map(vId => getUserDetails(vId)?.name || 'Unknown').join(', ');

                        return (
                          <div 
                            key={option.id} 
                            onClick={() => {
                              if (!carouselPoll.startsAt || new Date(carouselPoll.startsAt).getTime() <= now) {
                                handleVote(carouselPoll.id, option.id);
                              }
                            }}
                            className={`relative group overflow-hidden rounded-xl border transition-all duration-300 ${(!carouselPoll.startsAt || new Date(carouselPoll.startsAt).getTime() <= now) ? 'cursor-pointer ' + (isSelected ? 'border-blue-300 shadow-md shadow-blue-500/10' : 'border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md') : 'cursor-not-allowed opacity-75 border-slate-200/50'}`}
                            title={carouselPoll.startsAt && new Date(carouselPoll.startsAt).getTime() > now ? 'Voting opens when poll starts' : (voterNames ? `Voted by: ${voterNames}` : 'No votes yet')}
                          >
                            {/* Background Progress Fill */}
                            <div 
                              className={`absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out ${isSelected ? 'bg-blue-100/80' : 'bg-slate-100'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                            
                            {/* Content */}
                            <div className="relative z-10 flex items-center justify-between px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-5 h-5 rounded-full border-[1.5px] transition-colors ${isSelected ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/40' : 'border-slate-300 bg-white group-hover:border-slate-400'}`}>
                                  {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </div>
                                <span className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                  {option.text}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                  {percentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-6 border-t border-slate-200/60 sm:px-4 gap-4 sm:gap-0">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2.5 hover:space-x-1 transition-all duration-300 cursor-default">
                          {/* Get unique voters */}
                          {Array.from(new Set(carouselPoll.options.flatMap(o => o.votes))).slice(0, 4).map((voterId, i) => (
                             getUserDetails(voterId)?.profileImage ? (
                                <img key={voterId} src={getUserDetails(voterId)?.profileImage} className="w-9 h-9 rounded-full border-[2.5px] border-white shadow-sm relative z-30 transition-transform hover:scale-110 hover:z-50" style={{ zIndex: 40 - i }} />
                             ) : (
                                <div key={voterId} className="w-9 h-9 rounded-full border-[2.5px] border-white bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-bold relative shadow-sm transition-transform hover:scale-110 hover:z-50" style={{ zIndex: 40 - i }}>
                                  {getUserDetails(voterId)?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                             )
                          ))}
                          {Array.from(new Set(carouselPoll.options.flatMap(o => o.votes))).length > 4 && (
                            <div className="w-9 h-9 rounded-full border-[2.5px] border-white bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-extrabold relative shadow-sm transition-transform hover:scale-110 hover:z-50" style={{ zIndex: 0 }}>
                              +{Array.from(new Set(carouselPoll.options.flatMap(o => o.votes))).length - 4}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {Array.from(new Set(carouselPoll.options.flatMap(o => o.votes))).length} participants
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        {carouselPoll.createdBy === user?.id && (
                          <button 
                            onClick={() => handleClosePoll(carouselPoll.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-lg font-bold text-xs transition-all shadow-sm border border-red-200/60 hover:shadow"
                          >
                            Close Poll
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedPollForVoters(carouselPoll.id)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold text-xs transition-all shadow-md hover:shadow-lg shadow-blue-500/20"
                        >
                          View Voted Members
                        </button>
                      </div>
                    </div>

                    {/* Carousel Dots */}
                    {sortedActivePolls.length > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        {sortedActivePolls.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentCarouselIndex(idx)}
                            className={`rounded-full transition-all duration-300 ${idx === currentCarouselIndex % sortedActivePolls.length ? 'w-6 h-1.5 bg-blue-600 shadow-sm shadow-blue-500/40' : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'}`}
                            aria-label={`Go to poll ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-medium min-h-[300px] z-10">
                    <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <BarChart2 className="w-8 h-8 text-slate-300" />
                    </div>
                    No active polls found. Create one to get started!
                  </div>
                )}
              </div>

              {/* Insights Column */}
              <div className="flex flex-col gap-6">
                {/* Poll Insights Card */}
                <div className="bg-blue-700 text-white rounded-xl shadow-sm p-6 relative overflow-hidden h-full min-h-[250px]">
                  <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
                    <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="font-semibold text-lg">Poll Insights</h3>
                    <Info className="w-4 h-4 text-blue-300" />
                  </div>
                  <p className="text-blue-100 text-sm leading-relaxed mb-6 relative z-10">
                    Your workspace has <span className="font-bold text-white underline decoration-blue-400 decoration-2">85% participation rate</span> this week. Engagement is up 12% from last month.
                  </p>
                  <div className="flex items-end justify-between relative z-10 mt-auto pt-6">
                    <div>
                      <div className="text-4xl font-extrabold">{activePolls.length}</div>
                      <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mt-1">Active Polls</div>
                    </div>
                    <div className="flex items-end gap-1.5 opacity-80 h-10">
                      <div className="w-1.5 bg-white rounded-t h-4"></div>
                      <div className="w-1.5 bg-white rounded-t h-6"></div>
                      <div className="w-1.5 bg-white rounded-t h-3"></div>
                      <div className="w-1.5 bg-white rounded-t h-8"></div>
                      <div className="w-1.5 bg-white rounded-t h-5"></div>
                    </div>
                  </div>
                </div>

                {/* Active members removed as per user request */}
              </div>
            </div>

            {/* Recent History Section */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Recent History</h2>
              
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                {/* Tabs */}
                <div className="flex items-center justify-end p-4 border-b border-slate-100">
                  <div className="flex bg-slate-100 rounded-md p-1">
                    <button 
                      onClick={() => setActiveTab('all')}
                      className={`px-4 py-1.5 text-xs font-bold rounded ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      All Polls
                    </button>
                    <button 
                      onClick={() => setActiveTab('participated')}
                      className={`px-4 py-1.5 text-xs font-bold rounded ${activeTab === 'participated' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Participated
                    </button>
                    <button 
                      onClick={() => setActiveTab('closed')}
                      className={`px-4 py-1.5 text-xs font-bold rounded ${activeTab === 'closed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Closed
                    </button>
                  </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/50 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-5">Poll Details</div>
                  <div className="col-span-3">Creator</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Activity</div>
                </div>

                {/* Table Rows */}
                <div className="flex flex-col">
                  {paginatedPolls.map((poll) => {
                    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
                    const isUpcoming = poll.isActive && poll.startsAt && new Date(poll.startsAt).getTime() > now;
                    const isPollActive = poll.isActive && (!poll.startsAt || new Date(poll.startsAt).getTime() <= now) && (!poll.expiresAt || new Date(poll.expiresAt).getTime() > now);
                    const creator = getUserDetails(poll.createdBy);

                    return (
                      <div key={poll.id} onClick={() => setSelectedPollForVoters(poll.id)} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-50 hover:bg-slate-50/80 transition-colors items-center group cursor-pointer">
                        <div className="col-span-5 pr-4">
                          <h4 className="text-sm font-bold text-slate-900 mb-1 truncate">{poll.question}</h4>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <Lock className="w-3 h-3" /> {totalVotes} total responses
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                          {creator?.profileImage ? (
                            <img src={creator.profileImage} alt="Creator" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                              {creator?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <span className="text-sm font-bold text-slate-700 truncate">{creator?.name || 'Unknown'}</span>
                        </div>
                        <div className="col-span-2">
                          {isUpcoming ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200">
                              Scheduled
                            </span>
                          ) : isPollActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-200 text-slate-600 border border-slate-300">
                              Closed
                            </span>
                          )}
                        </div>
                        <div className="col-span-2 flex items-center justify-between text-right">
                          <div className="flex flex-col gap-1 items-end">
                            <div className="text-[10px] font-medium text-slate-500 flex flex-col items-end">
                              <span className="flex items-center gap-1.5" title="Start Time">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                {poll.startsAt ? new Date(poll.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(poll.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              {poll.expiresAt && (
                                <span className="flex items-center gap-1.5 mt-0.5" title="End Time">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                  {new Date(poll.expiresAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                        </div>
                      </div>
                    );
                  })}
                  
                  {paginatedPolls.length === 0 && (
                    <div className="px-6 py-8 text-center text-slate-500 text-sm font-medium">
                      No polls found for the selected category.
                    </div>
                  )}
                </div>

                {/* Pagination footer */}
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of {totalItems} polls
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-1.5 rounded border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      <CreatePollModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        workspaceId={workspaceId as string} 
      />

      {/* Voters Modal */}
      {selectedPollForVoters && (() => {
        const poll = workspacePolls.find(p => p.id === selectedPollForVoters);
        if (!poll) return null;
        return (
          <VotedMembersModal 
            poll={poll} 
            onClose={() => setSelectedPollForVoters(null)} 
          />
        );
      })()}
    </WorkspaceLayout>
  );
};

// Removed unused icons
