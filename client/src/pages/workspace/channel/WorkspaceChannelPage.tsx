import { useState, useEffect, useRef } from 'react';
import { WorkspaceLayout } from '../../../layouts/WorkspaceLayout';
import { Hash, X, AlertCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store/index';
import { addPoll, updatePoll, removePoll } from '../../../store/slices/pollSlice';
import { useSocket } from '../../../hooks/useSocket';
import { MessageService } from '../../../api/workspace/message.service';
import { ChannelService } from '../../../api/workspace/channel.service';
import { useWorkspaceChannels, useChannelMembers } from '../../../hooks/useChannels';
import { useChannelMessages } from '../../../hooks/useMessages';
import { useChannelThread } from '../../../hooks/useChannelThread';
import { useAiCommand } from '../../../hooks/useAi';
import { ChannelMembersSidebar } from '../../../components/workspace/ChannelMembersSidebar';
import { AddChannelMemberModal } from '../../../components/workspace/AddChannelMemberModal';
import { ChannelSettingsModal } from '../../../components/workspace/ChannelSettingsModal';
import type { MessageData, ChannelData } from '../../../types/channel.types';
import { ChannelHeader } from '../../../components/workspace/channel/ChannelHeader';
import { ChannelMessageList } from '../../../components/workspace/channel/ChannelMessageList';
import { ChannelMessageInput } from '../../../components/workspace/channel/ChannelMessageInput';
import { ChannelNotMemberView } from '../../../components/workspace/channel/ChannelNotMemberView';
import { ThreadSidebar } from '../../../components/workspace/channel/ThreadSidebar';
import { ChannelPollsList } from '../../../components/polls/ChannelPollsList';
import { CreatePollModal } from '../../../components/polls/CreatePollModal';
import { AiDashboardModal } from '../../../components/workspace/channel/AiDashboardModal';
import type { AiTab } from '../../../components/workspace/channel/AiDashboardModal';
import { AiService } from '../../../api/ai/ai.service';
import { getMessageId } from '../../../utils/message.utils';
import { WorkspaceService } from '../../../api/workspace/workspace.service';
import type { Workspace } from '../../../types/workspace.types';
import toast from 'react-hot-toast';

export const WorkspaceChannelPage = () => {
  const { workspaceId, channelId } = useParams<{ workspaceId: string, channelId: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);

  const { channels, setChannels, refetch: refetchChannels } = useWorkspaceChannels(workspaceId);
  const [currentChannel, setCurrentChannel] = useState<ChannelData | null>(null);
  const [isWorkspaceOwner, setIsWorkspaceOwner] = useState(false);
  const [isJoiningChannel, setIsJoiningChannel] = useState(false);
  const joinedChannelRef = useRef(false);

  const isChannelMember =
    Boolean(currentChannel?.isMember) || joinedChannelRef.current;

  const { members: channelMembers, setMembers: setChannelMembers, imageMap: memberImagesMap, setImageMap: setMemberImagesMap, refetch: refetchMembers } = useChannelMembers(workspaceId, channelId, isChannelMember);

  const {
    messages, setMessages, loading: isLoadingMessages, hasMore: hasMoreMessages,
    totalMessages, currentPage, fetchMessages
  } = useChannelMessages(workspaceId, channelId);

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [showMembersSidebar, setShowMembersSidebar] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [isAiDashboardOpen, setIsAiDashboardOpen] = useState(false);
  const [aiDashboardTab, setAiDashboardTab] = useState<AiTab>('tasks');
  const [aiTaskCount, setAiTaskCount] = useState(0);
  const [aiReminderCount, setAiReminderCount] = useState(0);
  const [aiScheduleCount, setAiScheduleCount] = useState(0);
  const [aiNotifyCount, setAiNotifyCount] = useState(0);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { processCommand, isLoading: isProcessingAi } = useAiCommand();

  useEffect(() => {
    joinedChannelRef.current = false;
  }, [channelId]);

  useEffect(() => {
    if (!workspaceId) return;
    WorkspaceService.getUserWorkspaces()
      .then((res) => {
        const list = (res.data || []) as Workspace[];
        const current = list.find((ws) => ws.id === workspaceId);
        setAiAssistantEnabled(Boolean(current?.aiAssistantEnabled));
      })
      .catch(() => setAiAssistantEnabled(false));
  }, [workspaceId]);

  useEffect(() => {
    if (channels.length > 0 && channelId) {
      const channel = channels.find(c => c.id === channelId);
      if (!channel) return;
      if (!currentChannel || currentChannel.id !== channel.id) {
        setCurrentChannel(channel);
        return;
      }
      const mergedIsMember = channel.isMember || joinedChannelRef.current;
      if (
        currentChannel.isMember !== mergedIsMember ||
        currentChannel.hasPendingRequest !== channel.hasPendingRequest
      ) {
        setCurrentChannel(prev => prev ? {
          ...prev,
          isMember: mergedIsMember,
          hasPendingRequest: channel.hasPendingRequest,
        } : { ...channel, isMember: mergedIsMember });
      }
    }
  }, [channels, channelId, currentChannel]);

  const socket = useSocket(workspaceId);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [initialUnreadCount, setInitialUnreadCount] = useState(0);
  const [scrollToBottomSignal, setScrollToBottomSignal] = useState(0);

  const {
    showThread,
    threadRootMessage,
    threadReplies,
    isLoadingThread,
    handleOpenThread,
    handleCloseThread,
    handleSendThreadReply,
    handleThreadReplyReceived
  } = useChannelThread({
    workspaceId,
    channelId,
    user,
    socket,
    setMessages,
    onOpenMembersClose: () => setShowMembersSidebar(false)
  });

  const handleMarkChannelAsRead = (readUpto?: string) => {
    if (!workspaceId || !channelId) return;
    ChannelService.markAsRead(workspaceId, channelId, readUpto)
      .then(() => {
        window.dispatchEvent(new CustomEvent('channel-read', { detail: { channelId } }));
        setInitialUnreadCount(0);
      })
      .catch(err => console.error('Failed to mark channel as read', err));
  };

  const fetchChannelData = async (options?: { skipChannelListRefetch?: boolean }) => {
    if (currentChannel?.isActive === false) return;
    const canAccessChannel =
      Boolean(currentChannel?.isMember) || joinedChannelRef.current;
    if (!canAccessChannel) return;

    if (workspaceId && channelId) {
      if (!options?.skipChannelListRefetch) {
        refetchChannels();
      }
      refetchMembers();

      try {
        const unreadRes = await ChannelService.getUnreadCounts(workspaceId);
        const counts = unreadRes.data?.data || unreadRes.data || {};
        setInitialUnreadCount(counts[channelId] || 0);
      } catch {
        setInitialUnreadCount(0);
      }

      await fetchMessages(1, true);

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

  const applyJoinedChannelState = async () => {
    joinedChannelRef.current = true;
    setCurrentChannel(prev => prev ? { ...prev, isMember: true, hasPendingRequest: false } : null);
    setChannels(prev => prev.map(channel =>
      channel.id === channelId
        ? { ...channel, isMember: true, hasPendingRequest: false }
        : channel
    ));
    await refetchMembers();
    await fetchMessages(1, true);
    if (workspaceId && channelId) {
      try {
        const unreadRes = await ChannelService.getUnreadCounts(workspaceId);
        const counts = unreadRes.data?.data || unreadRes.data || {};
        setInitialUnreadCount(counts[channelId] || 0);
      } catch {
        setInitialUnreadCount(0);
      }
    }
    await refetchChannels();
  };

  const handleJoinChannel = async () => {
    if (!workspaceId || !channelId || isJoiningChannel) return;
    setIsJoiningChannel(true);
    try {
      const res = await ChannelService.joinChannel(workspaceId, channelId);
      const payload = res.data || {};
      const status = payload.status as string | undefined;
      const joined =
        payload.success === true ||
        status === 'approved' ||
        /successfully joined/i.test(String(payload.message || ''));

      if (!joined && status !== 'pending') {
        import('react-hot-toast').then(m => m.default.error(payload.message || 'Failed to join channel'));
        return;
      }

      if (status === 'pending') {
        import('react-hot-toast').then(m => m.default.success('Join request sent to the channel creator'));
        setCurrentChannel(prev => prev ? { ...prev, hasPendingRequest: true } : null);
        setChannels(prev => prev.map(channel =>
          channel.id === channelId ? { ...channel, hasPendingRequest: true } : channel
        ));
        return;
      }

      import('react-hot-toast').then(m => m.default.success('Successfully joined the channel'));
      await applyJoinedChannelState();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || '';
      if (/already.*channel member/i.test(message)) {
        import('react-hot-toast').then(m => m.default.success('Successfully joined the channel'));
        await applyJoinedChannelState();
        return;
      }
      import('react-hot-toast').then(m => m.default.error(message || 'Failed to join channel'));
    } finally {
      setIsJoiningChannel(false);
    }
  };

  useEffect(() => {
    if (!currentChannel) return;
    if (currentChannel.isActive === false) return;
    if (!isChannelMember) return;

    fetchChannelData();
  }, [workspaceId, channelId, currentChannel?.id, currentChannel?.isActive, isChannelMember]);

  useEffect(() => {
    if (!socket || !channelId || currentChannel?.isActive === false) return;
    if (!isChannelMember) return;

    const joinChannel = () => {
      socket.emit('join_channel', channelId);
    };

    if (socket.connected) {
      joinChannel();
    }

    socket.on('connect', joinChannel);

    const handleNewMessage = (newMsg: MessageData) => {
      if (newMsg.threadRootId) return;

      setMessages(prev => {
        const incomingId = getMessageId(newMsg);
        if (prev.some(m => getMessageId(m) === incomingId)) return prev;
        return [...prev, newMsg];
      });
    };

    const handleTyping = (data: { userId: string, userName: string }) => {
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
      if (data.userId === user?.id) {
        import('react-hot-toast').then(m => {
          m.default.error(`You have been removed from this channel by ${data.removedBy}`, {
            duration: 4000,
            icon: '🚫'
          });
        });

        setTimeout(() => {
          navigate(`/workspace/${workspaceId}/channels`);
        }, 2000);
      } else {
        refetchMembers();
      }
    };

    socket.on('message_received', handleNewMessage);
    socket.on('thread_reply_received', handleThreadReplyReceived);
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
      socket.off('thread_reply_received', handleThreadReplyReceived);
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStopTyping);
      socket.off('member_removed', handleMemberRemoved);
      socket.off('new_poll');
      socket.off('poll_voted');
      socket.off('poll_deleted');
    };
  }, [socket, channelId, user, navigate, workspaceId, handleThreadReplyReceived, isChannelMember, currentChannel?.isActive]);

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
      
      const plainText = cleanMessage.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      const aiCommands = ['/task', '/notify', '/remind', '/summary', '/schedule'];
      const isAiCommand = aiCommands.some(cmd => plainText.startsWith(cmd));

      if (isAiCommand) {
        if (!aiAssistantEnabled) {
          toast.error('AI Assistant is locked on this workspace plan. Upgrade to enable it.');
          navigate('/billing');
          return;
        }

        // Clear input immediately so user knows it was intercepted
        if (textareaRef.current) textareaRef.current.innerHTML = '';
        setMessage('');
        checkFormatting();
        
        try {
          const aiResponse = await processCommand(plainText, workspaceId, channelId);
          if (aiResponse) {
             if (aiResponse.includes("summary has been successfully sent")) {
               toast.success('Summary successfully sent to your Direct Messages!');
             }
             const systemMsg: MessageData = {
               id: Date.now().toString(), // fake local ID
               channelId,
               senderId: 'ai-system',
               senderName: 'Agentic AI',
               content: aiResponse,
               messageType: 'ai',
               createdAt: new Date().toISOString()
             };
             setMessages(prev => [...prev, systemMsg]);
             setScrollToBottomSignal(prev => prev + 1);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'AI command failed';
          toast.error(message);
          if (message.toLowerCase().includes('upgrade') || message.toLowerCase().includes('not available')) {
            navigate('/billing');
          }
        }
        return;
      }

      // Extract mentioned user IDs from the HTML data attributes
      const mentionRegex = /data-mention-id="([^"]+)"/g;
      const mentionedUserIdsSet = new Set<string>();
      let match;
      while ((match = mentionRegex.exec(cleanMessage)) !== null) {
        mentionedUserIdsSet.add(match[1]);
      }
      const mentionedUserIds = Array.from(mentionedUserIdsSet);

      const res = await MessageService.sendMessage(workspaceId, channelId, {
        content: cleanMessage,
        messageType: msgType,
        imageUrl: attachedImageUrl || undefined,
        mentionedUserIds
      });
      const newMsg = res.data?.data;

      const newMsgObj = {
        ...newMsg,
        senderName: user.name,
      };

      setMessages(prev => {
        const msgId = getMessageId(newMsgObj);
        if (prev.some(m => getMessageId(m) === msgId)) return prev;
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

      setScrollToBottomSignal(prev => prev + 1);
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

  const handleAiCommandClick = (command: string) => {
    if (!aiAssistantEnabled) {
      toast.error('AI Assistant is locked on this workspace plan. Upgrade to enable it.');
      navigate('/billing');
      return;
    }
    if (textareaRef.current) {
      const currentHtml = textareaRef.current.innerHTML;
      const newHtml = currentHtml ? currentHtml + ' ' + command + ' ' : command + ' ';
      textareaRef.current.innerHTML = newHtml;
      setMessage(newHtml);
      textareaRef.current.focus();
      
      // Move cursor to the end
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(textareaRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const openAiDashboard = (tab: AiTab) => {
    if (!aiAssistantEnabled) {
      toast.error('AI Assistant is locked on this workspace plan. Upgrade to enable it.');
      navigate('/billing');
      return;
    }
    setAiDashboardTab(tab);
    setIsAiDashboardOpen(true);
  };

  const refreshAiCounts = async () => {
    if (!workspaceId || !aiAssistantEnabled) return;
    try {
      const res = await AiService.getDashboard(workspaceId);
      const counts = res.data.data.counts;
      setAiTaskCount(counts.tasks);
      setAiReminderCount(counts.reminders);
      setAiScheduleCount(counts.schedules);
      setAiNotifyCount(counts.notifications ?? 0);
    } catch {
      // Plan-locked or network errors should not break the channel UI.
    }
  };

  useEffect(() => {
    void refreshAiCounts();
  }, [workspaceId, aiAssistantEnabled]);

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
            isChannelMember={isChannelMember}
            user={user}
            pendingRequestsCount={pendingRequestsCount}
            workspaceId={workspaceId as string}
            channelId={channelId as string}
            channelMembers={channelMembers}
            isChannelDropdownOpen={isChannelDropdownOpen}
            setIsChannelDropdownOpen={setIsChannelDropdownOpen}
            setShowMembersSidebar={setShowMembersSidebar}
            onCloseThread={handleCloseThread}
            setIsSettingsModalOpen={setIsSettingsModalOpen}
            navigate={navigate}
            openAiDashboard={openAiDashboard}
            aiAssistantEnabled={aiAssistantEnabled}
            aiTaskCount={aiTaskCount}
            aiReminderCount={aiReminderCount}
            aiScheduleCount={aiScheduleCount}
            aiNotifyCount={aiNotifyCount}
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
          ) : !isChannelMember && currentChannel ? (
            <ChannelNotMemberView
              currentChannel={currentChannel}
              handleJoinChannel={handleJoinChannel}
              isJoining={isJoiningChannel}
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
                key={channelId}
                messages={messages}
                user={user}
                memberImagesMap={memberImagesMap}
                hasMoreMessages={hasMoreMessages}
                isLoadingMessages={isLoadingMessages}
                loadMoreMessages={loadMoreMessages}
                totalMessages={totalMessages}
                setSelectedImage={setSelectedImage}
                onOpenThread={handleOpenThread}
                channelId={channelId}
                initialUnreadCount={initialUnreadCount}
                onMarkAsRead={handleMarkChannelAsRead}
                scrollToBottomSignal={scrollToBottomSignal}
              />

              <ChannelMessageInput
                channelMembers={channelMembers}
                fileInputRef={fileInputRef}
                handleFileSelect={handleFileSelect}
                isUploading={isUploading}
                isProcessingAi={isProcessingAi}
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
                onAiCommandClick={handleAiCommandClick}
                aiAssistantEnabled={aiAssistantEnabled}
              />
            </>
          )}
        </div>

        {showMembersSidebar && (
          <ChannelMembersSidebar
            isOpen={showMembersSidebar}
            onClose={() => setShowMembersSidebar(false)}
            workspaceId={workspaceId || ''}
            channelId={channelId || ''}
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
          <ThreadSidebar
            isOpen={showThread}
            onClose={handleCloseThread}
            channelName={currentChannel?.name}
            rootMessage={threadRootMessage}
            replies={threadReplies}
            loading={isLoadingThread}
            user={user}
            memberImagesMap={memberImagesMap}
            onSendReply={handleSendThreadReply}
            setSelectedImage={setSelectedImage}
          />
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

          <AiDashboardModal
            isOpen={isAiDashboardOpen}
            onClose={() => {
              setIsAiDashboardOpen(false);
              void refreshAiCounts();
            }}
            defaultTab={aiDashboardTab}
            workspaceId={workspaceId as string}
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
