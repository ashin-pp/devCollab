import { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { WorkspaceLayout } from '../../../layouts/WorkspaceLayout';
import { Hash, Star, Bold, Italic, Code, Link as LinkIcon, List, Send, X, Smile, Plus, AtSign, ChevronDown, Users, Settings, LogOut, Lock, BarChart2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import type { RootState } from '../../../store/index';
import { addPoll, updatePoll, removePoll } from '../../../store/slices/pollSlice';
import { useSocket } from '../../../hooks/useSocket';
import { MessageService } from '../../../api/workspace/message.service';
import { format } from 'date-fns';

import { ChannelService } from '../../../api/workspace/channel.service';
import { useWorkspaceChannels, useChannelMembers } from '../../../hooks/useChannels';
import { useChannelMessages } from '../../../hooks/useMessages';
import { ChannelMembersSidebar } from '../../../components/workspace/ChannelMembersSidebar';
import { AddChannelMemberModal } from '../../../components/workspace/AddChannelMemberModal';
import { ChannelSettingsModal } from '../../../components/workspace/ChannelSettingsModal';
import type { MessageData, ChannelData } from '../../../types/channel.types';
import { ChannelHeader } from '../../../components/workspace/channel/ChannelHeader';
import { ChannelMessageList } from '../../../components/workspace/channel/ChannelMessageList';
import { ChannelMessageInput } from '../../../components/workspace/channel/ChannelMessageInput';
import { ChannelNotMemberView } from '../../../components/workspace/channel/ChannelNotMemberView';
import { ChannelPollsList } from '../../../components/polls/ChannelPollsList';
import { CreatePollModal } from '../../../components/polls/CreatePollModal';

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
  const [isWorkspaceOwner, setIsWorkspaceOwner] = useState(false);

  const { members: channelMembers, setMembers: setChannelMembers, imageMap: memberImagesMap, setImageMap: setMemberImagesMap, refetch: refetchMembers } = useChannelMembers(workspaceId, channelId);

  const {
    messages, setMessages, loading: isLoadingMessages, hasMore: hasMoreMessages,
    totalMessages, currentPage, fetchMessages
  } = useChannelMessages(workspaceId, channelId);

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [showMembersSidebar, setShowMembersSidebar] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (currentChannel?.isActive === false) return;
    
    if (workspaceId && channelId) {
      refetchChannels();
      fetchMessages(1, true); // Fetch first page and reset
      refetchMembers();

      import('../../../api/workspace/workspace.service').then(({ WorkspaceService }) => {
        WorkspaceService.getWorkspaceMembers(workspaceId, false)
          .then(res => {
            const members = res.data?.data || [];
            const isOwner = channels.find(c => c.workspaceId === workspaceId)?.createdBy === user?.id || 
                            members.some((m: any) => m.userId === user?.id && m.role === 'owner');
            setIsWorkspaceOwner(isOwner);
          })
          .catch(err => console.error('Failed to fetch workspace members', err));
      });

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
    if (!currentChannel) return; // Wait for channel data to load
    if (currentChannel.isActive === false) return;

    fetchChannelData();

    // Mark channel as read when user enters
    if (workspaceId && channelId && currentChannel?.isActive !== false) {
      ChannelService.markAsRead(workspaceId, channelId)
        .then(() => {
          // Emit event to parent to clear unread count
          window.dispatchEvent(new CustomEvent('channel-read', { detail: { channelId } }));
        })
        .catch(err => console.error('Failed to mark channel as read', err));
    }
  }, [workspaceId, channelId, currentChannel?.id, currentChannel?.isActive]);

  useEffect(() => {
    if (!socket || !channelId || currentChannel?.isActive === false) return;

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { UploadService } = await import('../../../services/UploadService');
      const res = await UploadService.uploadChatImage(file);
      if (res.data?.data?.imageUrl) {
        setAttachedImageUrl(res.data.data.imageUrl);
      }
    } catch (err) {
      console.error('Failed to upload image', err);
      import('react-hot-toast').then(m => m.default.error('Failed to upload image'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    const isTextEmpty = !message.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    if ((isTextEmpty && !attachedImageUrl) || !workspaceId || !channelId || !user) return;

    try {
      const msgType = attachedImageUrl ? 'image' : 'text';
      const cleanMessage = isTextEmpty ? '' : message;
      
      // Extract mentioned user IDs from the HTML data attributes
      const mentionRegex = /data-mention-id="([^"]+)"/g;
      const mentionedUserIdsSet = new Set<string>();
      let match;
      while ((match = mentionRegex.exec(cleanMessage)) !== null) {
        mentionedUserIdsSet.add(match[1]);
      }
      const mentionedUserIds = Array.from(mentionedUserIdsSet);

      const res = await MessageService.sendMessage(workspaceId, channelId, cleanMessage, msgType, attachedImageUrl || undefined, mentionedUserIds);
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
      setAttachedImageUrl(null);
      setTypingUsers(prev => prev.filter(id => id !== user?.id));

      // Emit socket event
      if (socket) {
        socket.emit('new_message', newMsgObj);
        socket.emit('stop_typing', { channelId, userId: user.id, userName: user.name });
      }

      setMessage('');
      if (document.queryCommandState('bold')) document.execCommand('bold', false, undefined);
      if (document.queryCommandState('italic')) document.execCommand('italic', false, undefined);
      checkFormatting();

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

  if (!channelId) {
    return (
      <WorkspaceLayout>
        <div className="flex-1 flex items-center justify-center bg-slate-50 h-full">
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md w-full mx-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Hash className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to Channels</h2>
            <p className="text-sm text-slate-500">Select a channel from the sidebar to start messaging with your team.</p>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      <div className="flex-1 flex h-full overflow-hidden bg-white">

        <div className={`flex-1 flex flex-col h-full transition-all ${showThread ? 'border-r border-slate-200' : ''}`}>

          <ChannelHeader
            currentChannel={currentChannel}
            user={user}
            pendingRequestsCount={pendingRequestsCount}
            workspaceId={workspaceId as string}
            channelId={channelId as string}
            channelMembers={channelMembers}
            isChannelDropdownOpen={isChannelDropdownOpen}
            setIsChannelDropdownOpen={setIsChannelDropdownOpen}
            setShowMembersSidebar={setShowMembersSidebar}
            setShowThread={setShowThread}
            setIsSettingsModalOpen={setIsSettingsModalOpen}
            navigate={navigate}
          />

          {currentChannel?.isActive === false ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 h-full">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Channel Blocked</h2>
              <p className="text-slate-500 text-center max-w-md">
                This channel has been blocked by a workspace admin or owner. You cannot view messages, send messages, or interact with this channel.
              </p>
            </div>
          ) : currentChannel?.isMember === false ? (
            <ChannelNotMemberView
              currentChannel={currentChannel}
              handleJoinChannel={handleJoinChannel}
            />
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

              <ChannelMessageList
                messages={messages}
                user={user}
                memberImagesMap={memberImagesMap}
                hasMoreMessages={hasMoreMessages}
                isLoadingMessages={isLoadingMessages}
                loadMoreMessages={loadMoreMessages}
                totalMessages={totalMessages}
                messagesEndRef={messagesEndRef}
                setSelectedImage={setSelectedImage}
              />

              <ChannelMessageInput
                channelMembers={channelMembers}
                fileInputRef={fileInputRef}
                handleFileSelect={handleFileSelect}
                isUploading={isUploading}
                attachedImageUrl={attachedImageUrl}
                setAttachedImageUrl={setAttachedImageUrl}
                textareaRef={textareaRef}
                handleTyping={handleTyping}
                setMessage={setMessage}
                message={message}
                checkFormatting={checkFormatting}
                handleKeyDown={handleKeyDown}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                isBoldActive={isBoldActive}
                isItalicActive={isItalicActive}
                handleFormat={handleFormat}
                setIsCreatePollModalOpen={setIsCreatePollModalOpen}
                handleSendMessage={handleSendMessage}
              />
            </>
          )}
        </div>

        {showMembersSidebar && (
          <ChannelMembersSidebar
            isOpen={showMembersSidebar}
            onClose={() => setShowMembersSidebar(false)}
            workspaceId={workspaceId}
            channelId={channelId}
            channelName={currentChannel?.name || 'channel'}
            channelCreatorId={currentChannel?.createdBy}
            channelPrivacy={currentChannel?.privacy}
            isWorkspaceOwner={isWorkspaceOwner}
            onOpenAddMember={() => setIsAddMemberModalOpen(true)}
            onMemberRemoved={() => {
              if (workspaceId && channelId) {
                ChannelService.getMembers(workspaceId, channelId)
                  .then(res => {
                    const members = res.data?.data || [];
                    setChannelMembers(members);
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
        )}

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
      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-screen w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-800 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full size attachment"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </WorkspaceLayout>
  );
};
