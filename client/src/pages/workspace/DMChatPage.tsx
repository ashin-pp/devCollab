import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { WorkspaceLayout } from '../../layouts/WorkspaceLayout';
import { WorkspaceService } from '../../api/workspace/workspace.service';
import { DMService } from '../../api/dm/dm.service';


import type { RootState } from '../../store';
import {
  Send, Search, MessageSquarePlus, ArrowLeft,
  Check, CheckCheck, PenSquare, Info, X, Loader2
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { format, isToday, isYesterday } from 'date-fns';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInitials = (name?: string) =>
  name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

const avatarColors = [
  'bg-blue-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 'bg-pink-500',
];
const getAvatarColor = (id: string) => avatarColors[id.charCodeAt(0) % avatarColors.length];

const formatConvTime = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({
  user, size = 'md',
}: {
  user?: { name?: string; profileImage?: string; id?: string };
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClass = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' }[size];
  const color = getAvatarColor(user?.id || '0');
  return user?.profileImage ? (
    <img src={user.profileImage} alt={user.name} className={`${sizeClass} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${sizeClass} rounded-full ${color} text-white font-bold flex items-center justify-center shrink-0 select-none`}>
      {getInitials(user?.name)}
    </div>
  );
};

// ─── New Message Modal ────────────────────────────────────────────────────────

const NewMessageModal = ({
  members, onSelect, onClose, isStarting,
}: {
  members: any[];
  onSelect: (member: any) => void;
  onClose: () => void;
  isStarting: boolean;
}) => {
  const [q, setQ] = useState('');
  const filtered = members.filter(m =>
    m.user?.name?.toLowerCase().includes(q.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">New Message</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
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

        {/* Member list */}
        <div className="flex-1 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No members found</div>
          ) : (
            filtered.map(m => (
              <div
                key={m.userId}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
              >
                <Avatar user={{ ...m.user, id: m.userId }} size="md" />
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

// ─── Conversation Sidebar ─────────────────────────────────────────────────────

const ConversationList = ({
  conversations, activeConvId, isLoading, searchTerm, setSearchTerm, onSelect, onNewDM,
}: {
  conversations: any[]; activeConvId?: string; isLoading: boolean;
  searchTerm: string; setSearchTerm: (s: string) => void;
  onSelect: (conv: any) => void; onNewDM: () => void;
}) => {
  const filtered = conversations.filter(c =>
    c.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-72 border-r border-slate-200 flex flex-col bg-white shrink-0">
      {/* Header */}
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

      {/* Search */}
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

      {/* List */}
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
          filtered.map(conv => {
            const isActive = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${
                  isActive ? 'bg-blue-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar user={{ ...conv.otherUser, id: conv.otherUser?.id || conv.participant2Id }} size="md" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-sm font-semibold truncate ${isActive ? 'text-blue-700' : 'text-slate-900'}`}>
                      {conv.otherUser?.name || 'Unknown'}
                    </span>
                    {conv.lastMessageAt && (
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatConvTime(conv.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─── Chat Panel ───────────────────────────────────────────────────────────────

const ChatPanel = ({
  conversation, messages, newMessage, isLoading, otherUserTyping, currentUser,
  onChangeMessage, onSendMessage, messagesEndRef,
}: {
  conversation: any; messages: any[]; newMessage: string; isLoading: boolean;
  otherUserTyping: boolean; currentUser: any;
  onChangeMessage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) => {
  const otherUser = conversation?.otherUser;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar user={{ ...otherUser, id: otherUser?.id }} size="sm" />
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">{otherUser?.name || 'Direct Message'}</p>
            {otherUserTyping ? (
              <p className="text-xs text-blue-500 font-medium animate-pulse">Typing...</p>
            ) : (
              <p className="text-xs text-emerald-500 font-medium">● Online</p>
            )}
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="View Profile">
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 bg-slate-50/30">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Avatar user={{ ...otherUser }} size="lg" />
            <h3 className="mt-4 text-base font-bold text-slate-900">{otherUser?.name}</h3>
            <p className="text-sm text-slate-500 mt-1">This is the beginning of your conversation.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {messages.map((msg, index) => {
              const isMine = msg.senderId === currentUser?.id;
              const prevMsg = messages[index - 1];
              const isGrouped = prevMsg?.senderId === msg.senderId;
              const showTimestamp =
                !prevMsg ||
                new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60 * 1000;

              return (
                <div key={msg.id || index}>
                  {/* Date divider */}
                  {showTimestamp && (
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">
                        {isToday(new Date(msg.createdAt))
                          ? `Today at ${format(new Date(msg.createdAt), 'h:mm a')}`
                          : format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                      </span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-2.5 group ${isMine ? 'flex-row-reverse' : 'flex-row'} ${
                      isGrouped && !showTimestamp ? 'mt-0.5' : 'mt-3'
                    }`}
                  >
                    {!isGrouped || showTimestamp ? (
                      <Avatar user={isMine ? currentUser : { ...otherUser, id: otherUser?.id }} size="sm" />
                    ) : (
                      <div className="w-8 shrink-0" />
                    )}

                    <div className={`flex flex-col gap-0.5 max-w-[65%] ${isMine ? 'items-end' : 'items-start'}`}>
                      {(!isGrouped || showTimestamp) && (
                        <span className="text-[11px] font-semibold text-slate-500 px-1">
                          {isMine ? 'You' : otherUser?.name}
                        </span>
                      )}
                      <div
                        className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div
                        className={`flex items-center gap-1 px-1 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isMine ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <span>{msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : ''}</span>
                        {isMine &&
                          (msg.isSeen ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Check className="w-3 h-3" />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={onSendMessage} className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all flex items-center px-4 py-2.5">
            <input
              type="text"
              value={newMessage}
              onChange={onChangeMessage}
              placeholder={`Message ${otherUser?.name || ''}...`}
              className="flex-1 bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 mt-1.5 px-1">
          Type <span className="font-mono font-semibold">/fix</span> to suggest code or{' '}
          <span className="font-mono font-semibold">/summary</span> for a chat recap
        </p>
      </div>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

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

// ─── Main Page ────────────────────────────────────────────────────────────────

export const DMChatPage = () => {
  const { workspaceId, conversationId } = useParams<{ workspaceId: string; conversationId?: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const socket = useSocket(workspaceId);

  // Conversations
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Active chat
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // New message modal
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const [isStartingConv, setIsStartingConv] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversations
  useEffect(() => {
    if (!workspaceId) return;
    DMService.getConversations(workspaceId)
      .then(res => setConversations(res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoadingConvs(false));
  }, [workspaceId]);

  // Set active conversation from URL param
  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) setActiveConversation(conv);
  }, [conversationId, conversations]);

  // Load messages
  useEffect(() => {
    if (!activeConversation) return;
    setLoadingMsgs(true);
    setMessages([]);
    DMService.getMessages(activeConversation.id)
      .then(res => setMessages(res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
    DMService.markAsSeen(activeConversation.id).catch(console.error);
    navigate(`/workspace/${workspaceId}/dm/${activeConversation.id}`, { replace: true });
  }, [activeConversation?.id]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  // Load workspace members when modal opens
  useEffect(() => {
    if (!showNewMsg || !workspaceId) return;
    WorkspaceService.getWorkspaceMembers(workspaceId, true)
      .then((res: any) => {
        // Backend returns response.data which is already the array (ApiResponse.success wraps in { data: [...] })
        const all: any[] = res.data || res || [];
        const currentId = currentUser?.id || (currentUser as any)?._id;
        // Show approved members only, exclude self
        const others = all.filter((m: any) => m.userId !== currentId && m.status === 'approved');
        setWorkspaceMembers(others);
      })
      .catch(console.error);
  }, [showNewMsg, workspaceId]);

  // Socket events
  useEffect(() => {
    if (!socket || !activeConversation || !currentUser) return;

    socket.emit('join_conversation', activeConversation.id);

    const handleDMReceived = (message: any) => {
      if (message.conversationId !== activeConversation.id) {
        setConversations(prev =>
          prev.map(c =>
            c.id === message.conversationId
              ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt }
              : c
          )
        );
        return;
      }
      setMessages(prev => (prev.find(m => m.id === message.id) ? prev : [...prev, message]));
      if (message.senderId !== currentUser.id) {
        DMService.markAsSeen(activeConversation.id).catch(console.error);
        socket.emit('dm_seen', { conversationId: activeConversation.id, userId: currentUser.id });
      }
    };
    const handleTyping = (data: any) => {
      if (data.userId !== currentUser.id) setOtherUserTyping(true);
    };
    const handleStopTyping = (data: any) => {
      if (data.userId !== currentUser.id) setOtherUserTyping(false);
    };
    const handleSeen = (data: any) => {
      if (data.userId !== currentUser.id) {
        setMessages(prev => prev.map(m => (m.senderId === currentUser.id ? { ...m, isSeen: true } : m)));
      }
    };

    socket.on('dm_received', handleDMReceived);
    socket.on('user_dm_typing', handleTyping);
    socket.on('user_dm_stopped_typing', handleStopTyping);
    socket.on('dm_messages_seen', handleSeen);

    return () => {
      socket.emit('leave_conversation', activeConversation.id);
      socket.off('dm_received', handleDMReceived);
      socket.off('user_dm_typing', handleTyping);
      socket.off('user_dm_stopped_typing', handleStopTyping);
      socket.off('dm_messages_seen', handleSeen);
    };
  }, [socket, activeConversation?.id, currentUser]);

  // Start a new conversation from the member picker
  const handleStartConversation = async (member: any) => {
    if (!workspaceId) return;
    setIsStartingConv(true);
    try {
      const res = await DMService.startConversation(workspaceId, member.userId);
      const newConv = res.data?.data;

      // Upsert conversation in the list
      setConversations(prev => {
        const exists = prev.find(c => c.id === newConv.id);
        if (exists) return prev;
        return [{ ...newConv, otherUser: member.user }, ...prev];
      });

      setActiveConversation({ ...newConv, otherUser: member.user });
      setShowNewMsg(false);
    } catch (err) {
      console.error('Failed to start conversation', err);
    } finally {
      setIsStartingConv(false);
    }
  };



  const handleChangeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
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
      socket?.emit('dm_stop_typing', {
        conversationId: activeConversation?.id,
        userName: currentUser?.name,
        userId: currentUser?.id,
      });
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    const content = newMessage.trim();
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
    try {
      const res = await DMService.sendMessage(activeConversation.id, content);
      const sentMessage = res.data?.data;
      setMessages(prev => [...prev, sentMessage]);
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConversation.id
            ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
      socket?.emit('new_dm', sentMessage);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <WorkspaceLayout>
      {/* Header */}
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ConversationList
          conversations={conversations}
          activeConvId={activeConversation?.id}
          isLoading={loadingConvs}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSelect={conv => setActiveConversation(conv)}
          onNewDM={() => setShowNewMsg(true)}
        />

        {activeConversation ? (
          <ChatPanel
            conversation={activeConversation}
            messages={messages}
            newMessage={newMessage}
            isLoading={loadingMsgs}
            otherUserTyping={otherUserTyping}
            currentUser={currentUser}
            onChangeMessage={handleChangeMessage}
            onSendMessage={handleSendMessage}
            messagesEndRef={messagesEndRef}
          />
        ) : (
          <NoChatSelected onNewDM={() => setShowNewMsg(true)} />
        )}
      </div>

      {/* New Message Modal */}
      {showNewMsg && (
        <NewMessageModal
          members={workspaceMembers}
          onSelect={handleStartConversation}
          onClose={() => setShowNewMsg(false)}
          isStarting={isStartingConv}
        />
      )}
    </WorkspaceLayout>
  );
};
