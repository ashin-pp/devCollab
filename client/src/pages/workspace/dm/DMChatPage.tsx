import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { WorkspaceLayout } from '../../../layouts/WorkspaceLayout';
import { WorkspaceService } from '../../../api/workspace/workspace.service';
import { DMService } from '../../../api/dm/dm.service';
import { AiService } from '../../../api/ai/ai.service';

import type { RootState } from '../../../store';
import {
  Search, MessageSquarePlus, ArrowLeft,
  PenSquare, X, Loader2
} from 'lucide-react';
import { useSocket } from '../../../hooks/useSocket';
import { format, isToday, isYesterday } from 'date-fns';
import type { Conversation, DirectMessage } from '../../../types/dm.types';
import type { MemberData } from '../../../types/workspace.types';

import { DMAvatar } from '../../../components/workspace/dm/DMAvatar';
import { DMHeader } from '../../../components/workspace/dm/DMHeader';
import { DMMessageList } from '../../../components/workspace/dm/DMMessageList';
import { DMMessageInput } from '../../../components/workspace/dm/DMMessageInput';
import { MemberProfileModal } from '../../../components/workspace/MemberProfileModal';

const formatConvTime = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
};

const sortConversationsByLatest = (convs: Conversation[]): Conversation[] => {
  return [...convs].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
};

const bumpConversationToTop = (
  convs: Conversation[],
  conversationId: string,
  patch: Partial<Conversation>
): Conversation[] => {
  const updated = convs.map(c =>
    c.id === conversationId ? { ...c, ...patch } : c
  );
  return sortConversationsByLatest(updated);
};

const NewMessageModal = ({
  members, onSelect, onClose, isStarting,
}: {
  members: MemberData[];
  onSelect: (member: MemberData) => void;
  onClose: () => void;
  isStarting: boolean;
}) => {
  const [q, setQ] = useState('');
  const filtered = members.filter(m =>
    (m.user?.name || '').toLowerCase().includes(q.toLowerCase()) ||
    (m.user?.email || '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">New Message</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Search members..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No members found</div>
          ) : (
            filtered.map(m => (
              <div
                key={m.userId}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
              >
                <DMAvatar user={{ ...m.user, id: m.userId }} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{m.user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{m.user?.email}</p>
                </div>
                {m.role === 'owner' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 shrink-0">
                    Owner
                  </span>
                )}
                <button
                  onClick={() => onSelect(m)}
                  disabled={isStarting}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm opacity-0 group-hover:opacity-100"
                >
                  {isStarting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                  )}
                  Chat
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ConversationList = ({
  conversations, activeConvId, isLoading, searchTerm, setSearchTerm, onSelect, onNewDM,
}: {
  conversations: Conversation[]; activeConvId?: string; isLoading: boolean;
  searchTerm: string; setSearchTerm: (s: string) => void;
  onSelect: (conv: Conversation) => void; onNewDM: () => void;
}) => {
  const filtered = conversations.filter(c =>
    (c.otherUser?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-72 border-r border-slate-200 flex flex-col bg-white shrink-0">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-bold text-slate-900">Messages</h2>
        <button
          onClick={onNewDM}
          title="New Message"
          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
        >
          <PenSquare className="w-5 h-5" />
        </button>
      </div>

      <div className="px-3 pb-3 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center pt-10">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center px-4 pt-10">
            <MessageSquarePlus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">No conversations yet</p>
            <button
              onClick={onNewDM}
              className="mt-3 text-blue-600 text-sm font-semibold hover:underline"
            >
              Start your first message →
            </button>
          </div>
        ) : (
          <div className="px-2 py-2 space-y-0.5">
            {filtered.map(conv => {
              const isActive = conv.id === activeConvId;
              const hasUnread = !!conv.unreadCount && conv.unreadCount > 0 && !isActive;
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50/80 ring-1 ring-blue-200 shadow-sm' 
                      : 'hover:bg-slate-100/80 active:bg-slate-200/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <DMAvatar user={{ ...conv.otherUser, id: conv.otherUser?.id }} size="md" />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${isActive ? 'bg-blue-500' : 'bg-emerald-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-sm font-bold truncate ${isActive ? 'text-blue-900' : hasUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                        {conv.otherUser?.name || 'Unknown'}
                      </span>
                      {conv.lastMessageAt && (
                        <span className={`text-[10px] font-medium shrink-0 ${isActive ? 'text-blue-500' : hasUnread ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                          {formatConvTime(conv.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-0.5">
                      <p className={`text-[13px] truncate ${isActive ? 'text-blue-700' : hasUnread ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                        {conv.lastMessage ? conv.lastMessage.replace(/<[^>]+>/g, '') : 'No messages yet'}
                      </p>
                      {hasUnread && (
                        <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold rounded-full shadow-md shadow-blue-500/30 transform transition-transform animate-pulse-once shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const NoChatSelected = ({ onNewDM }: { onNewDM: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30 text-center p-8">
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
      <MessageSquarePlus className="w-8 h-8 text-blue-500" />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-1">Your Messages</h3>
    <p className="text-sm text-slate-500 max-w-xs mb-5">
      Select a conversation from the left, or start a new direct message with a workspace member.
    </p>
    <button
      onClick={onNewDM}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
    >
      <PenSquare className="w-4 h-4" />
      New Message
    </button>
  </div>
);

export const DMChatPage = () => {
  const { workspaceId, conversationId } = useParams<{ workspaceId: string; conversationId?: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const socket = useSocket(workspaceId);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const [showNewMsg, setShowNewMsg] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<MemberData[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isFindingCall, setIsFindingCall] = useState(false);
  const [infoMember, setInfoMember] = useState<MemberData | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [isStartingConv, setIsStartingConv] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    setLoadingConvs(true);
    DMService.getConversations(workspaceId)
      .then(res => {
        const convs: Conversation[] = res.data?.data || [];
        setConversations(sortConversationsByLatest(convs));

        if (socket) {
          convs.forEach(c => socket.emit('join_conversation', c.id));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingConvs(false));
  }, [workspaceId, socket]);

  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) setActiveConversation(conv);
  }, [conversationId, conversations]);

  useEffect(() => {
    if (!activeConversation || !currentUser) return;
    setLoadingMsgs(true);
    setMessages([]);
    DMService.getMessages(activeConversation.id)
      .then(res => setMessages(res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
      
    DMService.markAsSeen(activeConversation.id).catch(console.error);
    
    setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c));
    
    if (socket) {
      socket.emit('dm_seen', { conversationId: activeConversation.id, userId: currentUser.id });
    }
    
    window.dispatchEvent(new CustomEvent('dm-read', { detail: { conversationId: activeConversation.id } }));
  }, [activeConversation?.id, currentUser, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  useEffect(() => {
    if (!showNewMsg || !workspaceId) return;
    WorkspaceService.getWorkspaceMembers(workspaceId, false)
      .then((res: { data?: MemberData[] | { data?: MemberData[] } }) => {
        const payload = res.data;
        const all = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        const currentId = currentUser?.id || (currentUser as { _id?: string })?._id;
        const others = all.filter((m: MemberData) => m.userId !== currentId && m.status === 'approved');
        setWorkspaceMembers(others);
      })
      .catch(console.error);
  }, [showNewMsg, workspaceId, currentUser]);

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleDMReceived = (message: DirectMessage) => {
      if (message.conversationId !== activeConversation?.id) {
        setConversations(prev =>
          bumpConversationToTop(prev, message.conversationId, {
            lastMessage: message.content || (message.messageType === 'image' ? 'Sent an image' : ''),
            lastMessageAt: message.createdAt,
            unreadCount: (prev.find(c => c.id === message.conversationId)?.unreadCount || 0)
              + (message.senderId !== currentUser.id ? 1 : 0)
          })
        );
        return;
      }
      setMessages(prev => (prev.find(m => m.id === message.id) ? prev : [...prev, message]));
      setConversations(prev =>
        bumpConversationToTop(prev, message.conversationId, {
          lastMessage: message.content || (message.messageType === 'image' ? 'Sent an image' : ''),
          lastMessageAt: message.createdAt
        })
      );
      if (message.senderId !== currentUser.id) {
        DMService.markAsSeen(activeConversation.id).catch(console.error);
        socket.emit('dm_seen', { conversationId: activeConversation.id, userId: currentUser.id });
      }
    };
    const handleTyping = (data: { conversationId: string, userName: string }) => {
      if (data.conversationId === activeConversation?.id) setOtherUserTyping(true);
    };
    const handleStopTyping = (data: { conversationId: string, userName: string }) => {
      if (data.conversationId === activeConversation?.id) setOtherUserTyping(false);
    };
    const handleSeen = (data: { userId: string }) => {
      if (data.userId !== currentUser.id) {
        setMessages(prev => prev.map(m => (m.senderId === currentUser.id ? { ...m, isSeen: true } : m)));
      }
    };

    socket.on('dm_received', handleDMReceived);
    socket.on('user_dm_typing', handleTyping);
    socket.on('user_dm_stopped_typing', handleStopTyping);
    socket.on('dm_messages_seen', handleSeen);

    return () => {
      socket.off('dm_received', handleDMReceived);
      socket.off('user_dm_typing', handleTyping);
      socket.off('user_dm_stopped_typing', handleStopTyping);
      socket.off('dm_messages_seen', handleSeen);
    };
  }, [socket, activeConversation?.id, currentUser]);

  const handleOpenInfo = async () => {
    if (!workspaceId || !activeConversation?.otherUser?.id) return;
    const otherId = activeConversation.otherUser.id;
    const cached = workspaceMembers.find((m) => m.userId === otherId);
    if (cached?.user?.email || cached?.user?.bio) {
      setInfoMember(cached);
      setIsInfoOpen(true);
      return;
    }
    try {
      const res = await WorkspaceService.getWorkspaceMembers(workspaceId, true);
      const all = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const member = (all as MemberData[]).find((m) => m.userId === otherId);
      if (!member) {
        toast.error('Could not load this person\'s details.');
        return;
      }
      setInfoMember(member);
      setIsInfoOpen(true);
    } catch {
      toast.error('Could not load this person\'s details.');
    }
  };

  const handleVideoCall = async () => {
    if (!workspaceId || !activeConversation?.id) return;

    setIsFindingCall(true);
    try {
      const res = await AiService.startDmVideoCall(workspaceId, activeConversation.id);
      const data = (res.data?.data ?? res.data) as {
        scheduleId?: string;
        message?: DirectMessage;
      };
      if (data.message) {
        setMessages((prev) =>
          prev.some((m) => m.id === data.message?.id) ? prev : [...prev, data.message as DirectMessage]
        );
        setConversations((prev) =>
          bumpConversationToTop(prev, activeConversation.id, {
            lastMessage: data.message?.content || 'Incoming video call',
            lastMessageAt: new Date().toISOString(),
          })
        );
        socket?.emit('new_dm', data.message);
      }
      if (!data.scheduleId) {
        toast.error('Could not start the video call.');
        return;
      }
      navigate(`/call/${data.scheduleId}`);
    } catch {
      toast.error('Could not start the video call.');
    } finally {
      setIsFindingCall(false);
    }
  };

  const handleStartConversation = async (member: MemberData) => {
    if (!workspaceId) return;
    setIsStartingConv(true);
    try {
      const res = await DMService.startConversation(workspaceId, member.userId);
      const newConv: Conversation = res.data?.data;

      if (newConv) {
        const otherUserMapped = { 
          id: member.userId, 
          name: member.user?.name || '', 
          profileImage: member.user?.profileImage 
        };
        setConversations(prev => {
          const exists = prev.find(c => c.id === newConv.id);
          if (exists) {
            return bumpConversationToTop(prev, newConv.id, {
              lastMessageAt: new Date().toISOString()
            });
          }
          return sortConversationsByLatest([{ ...newConv, otherUser: otherUserMapped }, ...prev]);
        });
        setShowNewMsg(false);
        navigate(`/workspace/${workspaceId}/dm/${newConv.id}`);
      }
    } catch (err) {
      console.error('Failed to start conversation', err);
    } finally {
      setIsStartingConv(false);
    }
  };

  const handleChangeMessage = (msg: string) => {
    setNewMessage(msg);
    if (socket && !isTyping && activeConversation) {
      setIsTyping(true);
      socket.emit('dm_typing', {
        conversationId: activeConversation.id,
        userName: currentUser?.name,
        userId: currentUser?.id,
      });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (activeConversation) {
        socket?.emit('dm_stop_typing', {
          conversationId: activeConversation.id,
          userName: currentUser?.name,
          userId: currentUser?.id,
        });
      }
    }, 2000);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const isTextEmpty = !newMessage.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    if ((isTextEmpty && !attachedImageUrl) || !activeConversation) return;
    
    const content = newMessage;
    setNewMessage('');
    if (socket) {
      setIsTyping(false);
      socket.emit('dm_stop_typing', {
        conversationId: activeConversation.id,
        userName: currentUser?.name,
        userId: currentUser?.id,
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
    if (!workspaceId || !activeConversation) return;

    try {
      const msgType = attachedImageUrl ? 'image' : 'text';
      const cleanMessage = isTextEmpty ? '' : content;
      const res = await DMService.sendMessage(activeConversation.id, cleanMessage, msgType, attachedImageUrl || undefined);
      setAttachedImageUrl(null);
      const sentMessage = res.data?.data;
      setMessages(prev => [...prev, sentMessage]);
      setConversations(prev =>
        bumpConversationToTop(prev, activeConversation.id, {
          lastMessage: cleanMessage || (attachedImageUrl ? 'Sent an image' : ''),
          lastMessageAt: new Date().toISOString()
        })
      );
      socket?.emit('new_dm', sentMessage);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <WorkspaceLayout>
      <div className="h-16 border-b border-slate-200 flex items-center px-4 shrink-0 bg-white z-10 shadow-sm">
        <button
          onClick={() => navigate(`/workspace/${workspaceId}/dm`)}
          className="p-2 mr-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Direct Messages</h2>
          <button
            onClick={() => setShowNewMsg(true)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <MessageSquarePlus className="w-4 h-4" /> New Message
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <ConversationList
          conversations={conversations}
          activeConvId={activeConversation?.id}
          isLoading={loadingConvs}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSelect={conv => navigate(`/workspace/${workspaceId}/dm/${conv.id}`)}
          onNewDM={() => setShowNewMsg(true)}
        />

        {activeConversation ? (
          <>
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <DMHeader
                otherUser={activeConversation.otherUser}
                otherUserTyping={otherUserTyping}
                onVideoCall={() => void handleVideoCall()}
                isFindingCall={isFindingCall}
                onInfo={() => void handleOpenInfo()}
              />
              <DMMessageList
                messages={messages}
                isLoading={loadingMsgs}
                currentUser={currentUser}
                otherUser={activeConversation.otherUser}
                messagesEndRef={messagesEndRef}
                setSelectedImage={setSelectedImage}
              />
              <DMMessageInput
                newMessage={newMessage}
                onChangeMessage={handleChangeMessage}
                onSendMessage={handleSendMessage}
                attachedImageUrl={attachedImageUrl}
                isUploading={isUploading}
                onFileSelect={handleFileSelect}
                onClearAttachment={() => setAttachedImageUrl(null)}
                fileInputRef={fileInputRef}
                otherUserName={activeConversation.otherUser?.name}
              />
            </div>
            
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
          </>
        ) : (
          <NoChatSelected onNewDM={() => setShowNewMsg(true)} />
        )}
      </div>

      {showNewMsg && (
        <NewMessageModal
          members={workspaceMembers}
          onSelect={handleStartConversation}
          onClose={() => setShowNewMsg(false)}
          isStarting={isStartingConv}
        />
      )}

      <MemberProfileModal
        isOpen={isInfoOpen}
        member={infoMember}
        onClose={() => setIsInfoOpen(false)}
        onViewProfile={() => {
          const userId = infoMember?.userId || activeConversation?.otherUser?.id;
          setIsInfoOpen(false);
          if (workspaceId && userId) {
            navigate(`/workspace/${workspaceId}/members/${userId}/profile`);
          }
        }}
      />
    </WorkspaceLayout>
  );
};
