import { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { WorkspaceLayout } from '../../layouts/WorkspaceLayout';
import { Hash, Star, Bold, Italic, Code, Link as LinkIcon, List, Send, X, Smile, Plus, AtSign, ChevronDown, Users, Settings, LogOut, Lock, BarChart2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import type { RootState } from '../../store/index';
import { addPoll, updatePoll, removePoll } from '../../store/slices/pollSlice';
import { useSocket } from '../../hooks/useSocket';
import { MessageService } from '../../api/workspace/message.service';
import { format } from 'date-fns';

import { ChannelService } from '../../api/workspace/channel.service';
import { useWorkspaceChannels, useChannelMembers } from '../../hooks/useChannels';
import { useChannelMessages } from '../../hooks/useMessages';
import { ChannelMembersModal } from '../../components/workspace/ChannelMembersModal';
import { AddChannelMemberModal } from '../../components/workspace/AddChannelMemberModal';
import { ChannelSettingsModal } from '../../components/workspace/ChannelSettingsModal';
import type { MessageData, ChannelData } from '../../types/channel.types';
import DOMPurify from 'dompurify';

const renderMessageContent = (content: string) => {
  if (!content) return null;
  // Convert old markdown format for backwards compatibility
  let html = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
  // Sanitize to prevent XSS
  const cleanHtml = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'br', 'div', 'span'] });
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
};
import { ChannelPollsList } from '../../components/polls/ChannelPollsList';
import { CreatePollModal } from '../../components/polls/CreatePollModal';

export const WorkspaceChannelPage = () => {
  const { workspaceId, channelId } = useParams<{ workspaceId: string, channelId: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLDivElement>(null);
  const [showThread, setShowThread] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);

  const { channels, refetch: refetchChannels } = useWorkspaceChannels(workspaceId);
  const [currentChannel, setCurrentChannel] = useState<ChannelData | null>(null);

  const { members: channelMembers, setMembers: setChannelMembers, imageMap: memberImagesMap, setImageMap: setMemberImagesMap, refetch: refetchMembers } = useChannelMembers(workspaceId, channelId);

  const {
    messages, setMessages, loading: isLoadingMessages, hasMore: hasMoreMessages,
    totalMessages, currentPage, fetchMessages
  } = useChannelMessages(workspaceId, channelId);

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);

  useEffect(() => {
    if (channels.length > 0 && channelId) {
      const channel = channels.find(c => c.id === channelId);
      if (channel && (!currentChannel || currentChannel.id !== channel.id)) {
        setCurrentChannel(channel);
      }
    }
  }, [channels, channelId]);

  const socket = useSocket(workspaceId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchChannelData = () => {
    if (workspaceId && channelId) {
      refetchChannels();
      fetchMessages(1, true); // Fetch first page and reset
      refetchMembers();

      // Fetch pending requests count if user is the channel creator
      ChannelService.getWorkspaceChannels(workspaceId)
        .then(res => {
          const channel = res.data?.data?.find((c: ChannelData) => c.id === channelId);
          if (channel && channel.createdBy === user?.id && channel.privacy === 'private') {
            ChannelService.getRequests(workspaceId, channelId)
              .then(requestsRes => {
                if (requestsRes.data?.success) {
                  setPendingRequestsCount((requestsRes.data.data || []).length);
                }
              })
              .catch(err => console.error('Failed to fetch pending requests', err));
          }
        })
        .catch(err => console.error('Failed to check channel creator', err));
    }
  };



  const loadMoreMessages = () => {
    if (hasMoreMessages && !isLoadingMessages) {
      fetchMessages(currentPage + 1, false);
    }
  };

  const handleJoinChannel = async () => {
    if (!workspaceId || !channelId) return;
    try {
      const res = await ChannelService.joinChannel(workspaceId, channelId);
      if (res.data?.success) {
        if (res.data.status === 'pending') {
          import('react-hot-toast').then(m => m.default.success('Join request sent to the channel creator'));
          setCurrentChannel(prev => prev ? { ...prev, hasPendingRequest: true } : null);
        } else {
          import('react-hot-toast').then(m => m.default.success('Successfully joined the channel'));
          setCurrentChannel(prev => prev ? { ...prev, isMember: true } : null);
          fetchChannelData();
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      import('react-hot-toast').then(m => m.default.error(err.response?.data?.message || 'Failed to join channel'));
    }
  };

  useEffect(() => {
    fetchChannelData();

    // Mark channel as read when user enters
    if (workspaceId && channelId) {
      ChannelService.markAsRead(workspaceId, channelId)
        .then(() => {
          // Emit event to parent to clear unread count
          window.dispatchEvent(new CustomEvent('channel-read', { detail: { channelId } }));
        })
        .catch(err => console.error('Failed to mark channel as read', err));
    }
  }, [workspaceId, channelId]);

  useEffect(() => {
    if (!socket || !channelId) return;

    const joinChannel = () => {
      socket.emit('join_channel', channelId);
    };

    if (socket.connected) {
      joinChannel();
    }

    socket.on('connect', joinChannel);

    const handleNewMessage = (newMsg: MessageData) => {
      setMessages(prev => {
        const incomingId = newMsg.id || newMsg._id;
        if (prev.some(m => (m.id || m._id) === incomingId)) return prev;
        return [...prev, newMsg];
      });
      scrollToBottom();
    };

    const handleTyping = (data: { userId: string, userName: string }) => {
      // Don't show current user's typing indicator
      if (data.userId === user?.id) return;

      setTypingUsers(prev => {
        if (!prev.includes(data.userName)) return [...prev, data.userName];
        return prev;
      });
    };

    const handleStopTyping = (data: { userId: string, userName: string }) => {
      setTypingUsers(prev => prev.filter(name => name !== data.userName));
    };

    const handleMemberRemoved = (data: { userId: string, userName: string, removedBy: string }) => {
      // If current user was removed
      if (data.userId === user?.id) {
        // Show immediate error notification
        import('react-hot-toast').then(m => {
          m.default.error(`You have been removed from this channel by ${data.removedBy}`, {
            duration: 4000,
            icon: '🚫'
          });
        });

        // Redirect after short delay
        setTimeout(() => {
          navigate(`/workspace/${workspaceId}/channels`);
        }, 2000);
      } else {
        // Add system message for other members
        const systemMessage: MessageData = {
          id: `system-${Date.now()}`,
          channelId: channelId,
          senderId: 'system',
          senderName: 'System',
          content: `${data.userName} was removed from the channel by ${data.removedBy}`,
          messageType: 'text',
          createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, systemMessage]);

        // Update channel members list
        refetchMembers();

        scrollToBottom();
      }
    };

    socket.on('message_received', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStopTyping);
    socket.on('member_removed', handleMemberRemoved);
    socket.on('new_poll', (poll) => {
      dispatch(addPoll(poll));
    });
    socket.on('poll_voted', (poll) => {
      dispatch(updatePoll(poll));
    });
    socket.on('poll_deleted', (pollId) => {
      dispatch(removePoll(pollId));
    });

    return () => {
      socket.off('connect', joinChannel);
      socket.emit('leave_channel', channelId);
      socket.off('message_received', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStopTyping);
      socket.off('member_removed', handleMemberRemoved);
      socket.off('new_poll');
      socket.off('poll_voted');
      socket.off('poll_deleted');
    };
  }, [socket, channelId, user, navigate, workspaceId]);

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (socket && channelId && user) {
      socket.emit('typing', { channelId, userId: user.id, userName: user.name });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { channelId, userId: user.id, userName: user.name });
      }, 2000);
    }
  };

  const handleSendMessage = async () => {
    if (!message.replace(/<[^>]+>/g, '').trim() || !workspaceId || !channelId || !user) return;

    try {
      const res = await MessageService.sendMessage(workspaceId, channelId, message);
      const newMsg = res.data?.data;

      const newMsgObj = {
        ...newMsg,
        senderName: user.name,
      };

      setMessages(prev => {
        const msgId = newMsgObj.id || newMsgObj._id;
        if (prev.some(m => (m.id || m._id) === msgId)) return prev;
        return [...prev, newMsgObj];
      });

      if (textareaRef.current) {
        textareaRef.current.innerHTML = '';
      }
      setTypingUsers(prev => prev.filter(id => id !== user?.id));

      // Emit socket event
      if (socket) {
        socket.emit('new_message', newMsgObj);
        socket.emit('stop_typing', { channelId, userId: user.id, userName: user.name });
      }

      setMessage('');

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFormat = (command: string) => {
    document.execCommand(command, false, undefined);
    if (textareaRef.current) {
      setMessage(textareaRef.current.innerHTML);
      textareaRef.current.focus();
    }
    checkFormatting();
  };

  const checkFormatting = () => {
    setIsBoldActive(document.queryCommandState('bold'));
    setIsItalicActive(document.queryCommandState('italic'));
  };

  if (!channelId) return <div className="p-8 text-center text-slate-500">Select a channel to start messaging</div>;

  return (
    <WorkspaceLayout>
      <div className="flex-1 flex h-full overflow-hidden bg-white">

        <div className={`flex-1 flex flex-col h-full transition-all ${showThread ? 'border-r border-slate-200' : ''}`}>

          <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
                  className="font-bold text-slate-900 text-lg flex items-center hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                >
                  {currentChannel?.privacy === 'private' ? (
                    <Lock className="w-5 h-5 text-orange-500 mr-1" />
                  ) : (
                    <Hash className="w-5 h-5 text-blue-600 mr-1" />
                  )}
                  {currentChannel?.name || 'channel'}
                  {currentChannel?.privacy === 'private' ? (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                      Private
                    </span>
                  ) : (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      Public
                    </span>
                  )}
                  {currentChannel?.createdBy === user?.id && currentChannel?.privacy === 'private' && pendingRequestsCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" title={`${pendingRequestsCount} pending request${pendingRequestsCount > 1 ? 's' : ''}`}>
                      {pendingRequestsCount}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 ml-1 text-slate-500" />
                </button>

                {isChannelDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 shadow-lg rounded-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        {currentChannel?.privacy === 'private' ? (
                          <Lock className="w-4 h-4 text-orange-500" />
                        ) : (
                          <Hash className="w-4 h-4 text-blue-600" />
                        )}
                        <h3 className="font-bold text-slate-900">{currentChannel?.name || 'channel'}</h3>
                        {currentChannel?.privacy === 'private' ? (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                            Private
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            Public
                          </span>
                        )}
                        {/* {currentChannel?.createdBy === user?.id && currentChannel?.privacy === 'private' && pendingRequestsCount > 0 && (
                          <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {pendingRequestsCount}
                          </span>
                        )} */}
                      </div>
                      {currentChannel?.description && (
                        <p className="text-xs text-slate-500 mt-1">{currentChannel.description}</p>
                      )}
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setIsMembersModalOpen(true); setIsChannelDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                      >
                        <Users className="w-4 h-4" /> View Members
                        {currentChannel?.createdBy === user?.id && currentChannel?.privacy === 'private' && pendingRequestsCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {pendingRequestsCount}
                          </span>
                        )}
                      </button>

                      {currentChannel?.createdBy === user?.id && (
                        <button
                          onClick={() => { setIsSettingsModalOpen(true); setIsChannelDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                        >
                          <Settings className="w-4 h-4" /> Channel Settings
                        </button>
                      )}
                    </div>
                    {currentChannel?.createdBy !== user?.id && (
                      <div className="py-1 border-t border-slate-100">
                        <button
                          onClick={async () => {
                            setIsChannelDropdownOpen(false);

                            const result = await Swal.fire({
                              title: 'Leave Channel?',
                              text: "Are you sure you want to leave this channel?",
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#ef4444',
                              cancelButtonColor: '#64748b',
                              confirmButtonText: 'Yes, leave channel'
                            });

                            if (!result.isConfirmed) return;

                            try {
                              await ChannelService.leaveChannel(workspaceId as string, channelId as string);
                              navigate(`/workspace/${workspaceId}/channels`);
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Leave Channel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button className="text-slate-400 hover:text-yellow-500 transition-colors">
                <Star className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md border border-blue-100 flex items-center gap-1 cursor-pointer hover:bg-blue-100">
                  @task <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px]">3</span>
                </span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md border border-blue-100 cursor-pointer hover:bg-blue-100">
                  @notify
                </span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md border border-blue-100 flex items-center gap-1 cursor-pointer hover:bg-blue-100">
                  @remind <span className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[9px]">5</span>
                </span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md border border-blue-100 cursor-pointer hover:bg-blue-100">
                  @info
                </span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md border border-blue-100 cursor-pointer hover:bg-blue-100">
                  @schedule
                </span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md border border-blue-100 cursor-pointer hover:bg-blue-100">
                  @summary
                </span>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => setIsMembersModalOpen(true)}
                  className="flex -space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
                  title="View channel members"
                >
                  {channelMembers.slice(0, 3).map((member, index) => {
                    const bgColors = ['bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-orange-100 text-orange-700'];
                    const zIndexes = ['z-30', 'z-20', 'z-10'];
                    return member.user?.profileImage ? (
                      <img
                        key={member.id}
                        src={member.user.profileImage}
                        alt={member.user.name}
                        className={`w-7 h-7 rounded-full border-2 border-white object-cover ${zIndexes[index]}`}
                      />
                    ) : (
                      <div key={member.id} className={`w-7 h-7 rounded-full ${bgColors[index % bgColors.length]} border-2 border-white flex items-center justify-center text-[10px] font-bold ${zIndexes[index]}`}>
                        {member.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    );
                  })}
                  {channelMembers.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 z-0">
                      +{channelMembers.length - 3}
                    </div>
                  )}
                  {channelMembers.length === 0 && (
                    <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                      0
                    </div>
                  )}
                </button>
              </div>
            </div>
          </header>

          {currentChannel?.isMember === false ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${currentChannel?.privacy === 'private' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                {currentChannel?.privacy === 'private' ? <Lock className="w-8 h-8" /> : <Hash className="w-8 h-8" />}
              </div>
              <div className="flex items-center gap-2 mb-2">
                {currentChannel?.privacy === 'private' ? (
                  <Lock className="w-5 h-5 text-orange-500" />
                ) : (
                  <Hash className="w-5 h-5 text-blue-600" />
                )}
                <h2 className="text-2xl font-bold text-slate-900">{currentChannel?.name}</h2>
                {currentChannel?.privacy === 'private' ? (
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-orange-100 text-orange-700">
                    Private
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-100 text-blue-700">
                    Public
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-center max-w-md mb-8">
                {currentChannel?.description || "You are not a member of this channel. Join to see messages and participate in the conversation."}
              </p>

              {currentChannel?.hasPendingRequest ? (
                <button
                  disabled
                  className="px-6 py-2.5 bg-slate-200 text-slate-500 font-semibold rounded-xl flex items-center gap-2 cursor-not-allowed"
                >
                  <Lock className="w-5 h-5" /> Request Pending
                </button>
              ) : (
                <button
                  onClick={handleJoinChannel}
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {currentChannel?.privacy === 'private' ? 'Request to Join' : 'Join Channel'}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Channel Polls */}
              <ChannelPollsList workspaceId={workspaceId as string} channelId={channelId as string} />

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="px-6 py-2 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-xs text-slate-600 italic">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                    <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc] relative">

                {/* Load More Messages Button */}
                {hasMoreMessages && (
                  <div className="flex justify-center pb-4">
                    <button
                      onClick={loadMoreMessages}
                      disabled={isLoadingMessages}
                      className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoadingMessages ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </>
                      ) : (
                        `Load older messages (${totalMessages - messages.length} more)`
                      )}
                    </button>
                  </div>
                )}

                {messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  const senderInitial = msg.senderName?.[0]?.toUpperCase() || 'U';
                  const isSystemMessage = msg.senderId === 'system';

                  // Get profile image from member map or use current user's image
                  const senderImage = isMe
                    ? user?.profileImage
                    : (memberImagesMap[msg.senderId] || msg.senderImage);

                  // System message (member removed, etc.)
                  if (isSystemMessage) {
                    return (
                      <div key={msg.id || msg._id as string} className="flex justify-center">
                        <div className="bg-orange-50 border border-orange-200 text-orange-800 text-sm px-4 py-2 rounded-full max-w-[80%] text-center">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id || msg._id as string} className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm overflow-hidden ${isMe ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {senderImage ? (
                          <img
                            src={senderImage}
                            alt={msg.senderName || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{senderInitial}</span>
                        )}
                      </div>
                      <div className={`flex-1 min-w-0 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span className="font-bold text-slate-900 text-sm">{isMe ? 'You' : (msg.senderName || 'User')}</span>
                          <span className="text-xs text-slate-500">
                            {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : 'Now'}
                          </span>
                        </div>
                        <div className={`text-[15px] leading-relaxed whitespace-pre-wrap px-4 py-2.5 max-w-[85%] shadow-sm ${isMe
                          ? 'bg-indigo-500 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/20'
                          : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm'
                          }`}>
                          {renderMessageContent(msg.content)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white">
                <div className="border border-slate-300 rounded-2xl overflow-visible focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-sm bg-slate-50 relative">

                  {/* AI Commands Bar - Minimal Pill Style */}
                  <div className="px-4 pt-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">AI</span>
                    <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">@task</button>
                    <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">@notify</button>
                    <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">@remind</button>
                    <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">@info</button>
                    <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">@schedule</button>
                    <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">@summary</button>
                  </div>

                  <div
                    ref={textareaRef}
                    contentEditable
                    onInput={(e) => {
                      handleTyping(e as any);
                      setMessage(e.currentTarget.innerHTML);
                      checkFormatting();
                    }}
                    onKeyDown={handleKeyDown}
                    onKeyUp={checkFormatting}
                    onMouseUp={checkFormatting}
                    className="w-full resize-none px-4 py-3 min-h-[60px] max-h-[200px] text-[15px] focus:outline-none text-slate-800 bg-transparent overflow-y-auto cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
                    data-placeholder="Message #channel..."
                  />

                  <div className="px-3 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      <div className="relative">
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className={`p-1.5 rounded-lg transition-colors ${showEmojiPicker ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                          title="Add Emoji"
                        >
                          <Smile className="w-5 h-5" />
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute bottom-full mb-2 left-0 z-50 shadow-2xl rounded-xl bg-white border border-slate-200 overflow-hidden">
                            <div className="flex justify-between items-center p-2 border-b border-slate-100 bg-slate-50">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Emojis</span>
                              <button onClick={() => setShowEmojiPicker(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <EmojiPicker
                              onEmojiClick={(emojiData) => {
                                setMessage(prev => prev + emojiData.emoji);
                                setShowEmojiPicker(false);
                              }}
                              width={320}
                              height={400}
                            />
                          </div>
                        )}
                      </div>
                      <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('bold')} className={`p-1.5 rounded-lg transition-colors ${isBoldActive ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`} title="Format Bold"><Bold className="w-4 h-4" /></button>
                      <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('italic')} className={`p-1.5 rounded-lg transition-colors ${isItalicActive ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`} title="Format Italic"><Italic className="w-4 h-4" /></button>
                      <button className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors" title="Mention"><AtSign className="w-4 h-4" /></button>
                      <div className="w-px h-5 bg-slate-300 mx-1.5"></div>
                      <button
                        onClick={() => setIsCreatePollModalOpen(true)}
                        className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors"
                        title="Create Poll"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors" title="Add Attachment"><Plus className="w-4 h-4" /></button>
                    </div>

                    <button
                      onClick={handleSendMessage}
                      disabled={!message.replace(/<[^>]+>/g, '').trim()}
                      className={`p-2 rounded-xl flex items-center justify-center transition-all ${message.replace(/<[^>]+>/g, '').trim()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {showThread && (
          <div className="w-[320px] md:w-[380px] bg-white flex flex-col shrink-0 border-l border-slate-200 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.05)] relative z-10">
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Thread</h3>
                <p className="text-xs text-slate-500"># development</p>
              </div>
              <button
                onClick={() => setShowThread(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0 text-xs">AL</div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">Alex Lee</span>
                    <span className="text-[10px] text-slate-500">10:24 AM</span>
                  </div>
                  <div className="text-slate-700 text-sm leading-relaxed">
                    I think I found the bottleneck in the validation loop. It looks like we're doing an unnecessary DB lookup inside the loop...
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">3 Replies</div>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center text-orange-700 font-bold shrink-0 text-xs">SM</div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">Sarah Miller</span>
                    <span className="text-[10px] text-slate-500">10:28 AM</span>
                  </div>
                  <div className="text-slate-700 text-sm leading-relaxed">
                    Checking the logs now. I see a few spikes in the staging environment as well.
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0 text-xs">AL</div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">Alex Lee</span>
                    <span className="text-[10px] text-slate-500">10:30 AM</span>
                  </div>
                  <div className="text-slate-700 text-sm leading-relaxed">
                    I might have found it. Is this the block you're talking about?
                  </div>
                  <div className="bg-[#1e1e2e] rounded border border-slate-700 p-2 mt-2 font-mono text-xs text-slate-300">
                    <span className="text-emerald-400">// middleware.go:84</span><br />
                    <span className="text-red-400">time.Sleep(50 * ms)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 text-xs">JD</div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">Jordan Dale</span>
                    <span className="text-[10px] text-slate-500">10:32 AM</span>
                  </div>
                  <div className="text-slate-700 text-sm leading-relaxed">
                    Yes, exactly! That shouldn't be in prod.
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-200">
              <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <textarea
                  placeholder="Reply to thread..."
                  className="w-full resize-none p-3 min-h-[80px] text-sm focus:outline-none text-slate-700 placeholder:text-slate-400"
                ></textarea>
                <div className="px-3 py-2 flex items-center justify-between bg-slate-50 border-t border-slate-200">
                  <div className="flex items-center">
                    <button className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"><Plus className="w-4 h-4" /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"><Smile className="w-4 h-4" /></button>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-xs font-bold transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {workspaceId && channelId && (
        <>
          <ChannelMembersModal
            isOpen={isMembersModalOpen}
            onClose={() => {
              setIsMembersModalOpen(false);
            }}
            workspaceId={workspaceId}
            channelId={channelId}
            channelCreatorId={currentChannel?.createdBy}
            channelPrivacy={currentChannel?.privacy}
            onOpenAddMember={() => setIsAddMemberModalOpen(true)}
            onMemberRemoved={() => {
              // Refresh channel members when someone is removed
              if (workspaceId && channelId) {
                ChannelService.getMembers(workspaceId, channelId)
                  .then(res => {
                    const members = res.data?.data || [];
                    setChannelMembers(members);

                    // Update member images map
                    const imageMap: Record<string, string> = {};
                    members.forEach((member: { userId: string; user?: { profileImage?: string } }) => {
                      if (member.user?.profileImage) {
                        imageMap[member.userId] = member.user.profileImage;
                      }
                    });
                    setMemberImagesMap(imageMap);
                  })
                  .catch(err => console.error('Failed to refresh channel members', err));
              }
            }}
          />

          <AddChannelMemberModal
            isOpen={isAddMemberModalOpen}
            onClose={() => setIsAddMemberModalOpen(false)}
            workspaceId={workspaceId}
            channelId={channelId}
          />

          <ChannelSettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            workspaceId={workspaceId}
            channelId={channelId}
            initialName={currentChannel?.name || ''}
            initialDescription={currentChannel?.description}
            initialPrivacy={currentChannel?.privacy}
            onChannelUpdated={fetchChannelData}
            onChannelDeleted={() => {
              window.location.href = `/workspace/${workspaceId}`;
            }}
          />

          <CreatePollModal
            isOpen={isCreatePollModalOpen}
            onClose={() => setIsCreatePollModalOpen(false)}
            workspaceId={workspaceId}
            channelId={channelId}
          />
        </>
      )}
    </WorkspaceLayout>
  );
};
