import { useEffect, useRef, useState } from 'react';
import { Lock, Send, Users, X } from 'lucide-react';
import type { ReplyVisibility } from '../../../types/channel.types';
import type { ThreadSidebarProps } from '../../../types/component.types';
import { ThreadMessageItem } from './ThreadMessageItem';

export const ThreadSidebar = ({
  isOpen,
  onClose,
  channelName,
  rootMessage,
  replies,
  loading,
  user,
  memberImagesMap,
  onSendReply,
  setSelectedImage
}: ThreadSidebarProps) => {
  const [replyText, setReplyText] = useState('');
  const [replyVisibility, setReplyVisibility] = useState<ReplyVisibility>('everyone');
  const [isSending, setIsSending] = useState(false);
  const repliesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReplyText('');
      setReplyVisibility('everyone');
    }
  }, [isOpen, rootMessage?.id]);

  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies.length]);

  if (!isOpen || !rootMessage) return null;

  const handleSend = async () => {
    const content = replyText.trim();
    if (!content || isSending) return;

    try {
      setIsSending(true);
      await onSendReply(content, replyVisibility);
      setReplyText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-[320px] md:w-[380px] bg-white flex flex-col shrink-0 border-l border-slate-200 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] relative z-10">
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Thread</h3>
          <p className="text-xs text-slate-500"># {channelName || 'channel'}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <ThreadMessageItem
          msg={rootMessage}
          user={user}
          memberImagesMap={memberImagesMap}
          setSelectedImage={setSelectedImage}
        />

        <div className="flex items-center gap-3 py-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </div>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          replies.map((reply) => (
            <ThreadMessageItem
              key={reply.id}
              msg={reply}
              user={user}
              memberImagesMap={memberImagesMap}
              setSelectedImage={setSelectedImage}
              compact
            />
          ))
        )}
        <div ref={repliesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReplyVisibility('everyone')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              replyVisibility === 'everyone'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Everyone
          </button>
          <button
            type="button"
            onClick={() => setReplyVisibility('author')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              replyVisibility === 'author'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Only author
          </button>
        </div>

        {replyVisibility === 'author' && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
            Only you and {rootMessage.senderId === user?.id ? 'yourself' : (rootMessage.senderName || 'the author')} can see this reply.
          </p>
        )}

        <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reply to thread..."
            className="w-full resize-none p-3 min-h-[80px] text-sm focus:outline-none text-slate-700 placeholder:text-slate-400"
          />
          <div className="px-3 py-2 flex items-center justify-end bg-slate-50 border-t border-slate-200">
            <button
              onClick={handleSend}
              disabled={!replyText.trim() || isSending}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
