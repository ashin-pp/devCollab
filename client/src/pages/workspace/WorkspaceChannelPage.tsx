import { useState, useEffect, useRef } from 'react';
import { WorkspaceLayout } from '../../layouts/WorkspaceLayout';
import { Hash, Star, Bold, Italic, Code, Link as LinkIcon, List, Send, X, Smile, Plus, AtSign } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import type { RootState } from '../../store/index';
import { useSocket } from '../../hooks/useSocket';
import { MessageService } from '../../api/workspace/message.service';
import { format } from 'date-fns';

interface MessageData {
  id: string;
  channelId: string;
  senderId: string;
  senderName?: string;
  content: string;
  messageType: 'text' | 'image';
  createdAt: string;
  [key: string]: unknown;
}

export const WorkspaceChannelPage = () => {
  const { workspaceId, channelId } = useParams<{ workspaceId: string, channelId: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [showThread, setShowThread] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const socket = useSocket(workspaceId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (workspaceId && channelId) {
      MessageService.getChannelMessages(workspaceId, channelId)
        .then(res => setMessages(res.data?.data?.reverse() || []))
        .catch(err => console.error('Failed to fetch messages', err));
    }
  }, [workspaceId, channelId]);

  useEffect(() => {
    if (!socket || !channelId) return;

    socket.emit('join_channel', channelId);

    const handleNewMessage = (newMsg: MessageData) => {
      setMessages(prev => [...prev, newMsg]);
      scrollToBottom();
    };

    const handleTyping = (data: { userId: string, userName: string }) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.userName)) return [...prev, data.userName];
        return prev;
      });
    };

    const handleStopTyping = (data: { userId: string, userName: string }) => {
      setTypingUsers(prev => prev.filter(name => name !== data.userName));
    };

    socket.on('message_received', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStopTyping);

    return () => {
      socket.emit('leave_channel', channelId);
      socket.off('message_received', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStopTyping);
    };
  }, [socket, channelId]);

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
      socket.emit('typing', { channelId, userName: user.name });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { channelId });
      }, 2000);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !workspaceId || !channelId || !user) return;
    
    try {
      const res = await MessageService.sendMessage(workspaceId, channelId, message);
      const newMsg = res.data?.data;
      
      // Emit socket event
      if (socket) {
        socket.emit('new_message', {
          ...newMsg,
          senderName: user.name, // temporary for display
        });
      }
      
      setMessage('');
      if (socket) socket.emit('stop_typing', { channelId });
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <WorkspaceLayout>
      <div className="flex-1 flex h-full overflow-hidden bg-white">

        <div className={`flex-1 flex flex-col h-full transition-all ${showThread ? 'border-r border-slate-200' : ''}`}>

          <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-slate-900 text-lg flex items-center">
                <Hash className="w-5 h-5 text-slate-400 mr-1" />
                channel
              </h2>
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
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 border border-white flex items-center justify-center text-[10px] font-bold text-blue-700 z-30">AL</div>
                  <div className="w-7 h-7 rounded-full bg-indigo-100 border border-white flex items-center justify-center text-[10px] font-bold text-indigo-700 z-20">JD</div>
                  <div className="w-7 h-7 rounded-full bg-orange-100 border border-white flex items-center justify-center text-[10px] font-bold text-orange-700 z-10">SM</div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[10px] font-bold text-slate-600 z-0">+12</div>
                </div>
              </div>
            </div>
          </header>

          <div className="px-6 py-2 border-b border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">Central engineering and platform architecture discussions.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {messages.map((msg) => (
              <div key={msg.id || msg._id} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                  {msg.senderName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-slate-900">{msg.senderName || 'User'}</span>
                    <span className="text-xs text-slate-500">
                      {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : 'Now'}
                    </span>
                  </div>
                  <div className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white">
            <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">

              <div className="bg-blue-50/50 border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 overflow-x-auto hide-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">AI Commands:</span>
                <span className="text-xs text-blue-600 bg-blue-100/50 px-2 rounded cursor-pointer hover:bg-blue-100">@task</span>
                <span className="text-xs text-blue-600 bg-blue-100/50 px-2 rounded cursor-pointer hover:bg-blue-100">@notify</span>
                <span className="text-xs text-blue-600 bg-blue-100/50 px-2 rounded cursor-pointer hover:bg-blue-100">@remind</span>
                <span className="text-xs text-blue-600 bg-blue-100/50 px-2 rounded cursor-pointer hover:bg-blue-100">@info</span>
                <span className="text-xs text-blue-600 bg-blue-100/50 px-2 rounded cursor-pointer hover:bg-blue-100">@schedule</span>
                <span className="text-xs text-blue-600 bg-blue-100/50 px-2 rounded cursor-pointer hover:bg-blue-100">@summary</span>
              </div>

              <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-1">
                <button className="p-1 text-slate-500 hover:bg-slate-200 rounded transition-colors"><Bold className="w-4 h-4" /></button>
                <button className="p-1 text-slate-500 hover:bg-slate-200 rounded transition-colors"><Italic className="w-4 h-4" /></button>
                <button className="p-1 text-slate-500 hover:bg-slate-200 rounded transition-colors"><Code className="w-4 h-4" /></button>
                <button className="p-1 text-slate-500 hover:bg-slate-200 rounded transition-colors"><LinkIcon className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <button className="p-1 text-slate-500 hover:bg-slate-200 rounded transition-colors"><List className="w-4 h-4" /></button>
              </div>

              <textarea
                value={message}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                placeholder="Message #channel (Use @task, @notify, @remind, @info, @schedule, @summary or type /fix for AI assistant)..."
                className="w-full resize-none p-4 min-h-[80px] text-[15px] focus:outline-none text-slate-700 placeholder:text-slate-400"
                rows={2}
              ></textarea>
              
              {typingUsers.length > 0 && (
                <div className="px-4 py-1 text-xs text-slate-500 italic">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              )}

              <div className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"><Plus className="w-5 h-5" /></button>
                  <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"><Smile className="w-5 h-5" /></button>
                  <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"><AtSign className="w-5 h-5" /></button>
                </div>
                <button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 font-semibold text-sm transition-colors">
                  Send <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
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
    </WorkspaceLayout>
  );
};
