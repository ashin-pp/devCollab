import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import type { MessageData } from '../../../types/channel.types';
import type { User } from '../../../types/auth.types';

const renderMessageContent = (content: string) => {
  if (!content) return null;
  // Convert old markdown format for backwards compatibility
  let html = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
  // Sanitize to prevent XSS
  const cleanHtml = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'br', 'div', 'span'] });
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
};

interface ChannelMessageListProps {
  messages: MessageData[];
  user: User | null;
  memberImagesMap: Record<string, string>;
  hasMoreMessages: boolean;
  isLoadingMessages: boolean;
  loadMoreMessages: () => void;
  totalMessages: number;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  setSelectedImage: (url: string) => void;
}

export const ChannelMessageList = ({
  messages,
  user,
  memberImagesMap,
  hasMoreMessages,
  isLoadingMessages,
  loadMoreMessages,
  totalMessages,
  messagesEndRef,
  setSelectedImage
}: ChannelMessageListProps) => {
  return (
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
        const isSystemMessage = msg.messageType === 'system';

        // Get profile image from member map or use current user's image
        const senderImage = isMe
          ? user?.profileImage
          : (memberImagesMap[msg.senderId] || msg.senderImage);

        // System message (member removed, etc.)
        if (isSystemMessage) {
          return (
            <div key={msg.id || msg._id as string} className="flex justify-center my-3">
              <div className="text-slate-400 text-xs text-center px-3 py-1 font-medium bg-slate-50/80 rounded-full border border-slate-100">
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
              <div className={`text-[15px] leading-relaxed whitespace-pre-wrap max-w-[85%] ${
                msg.messageType === 'image' && !msg.content?.trim()
                  ? 'bg-transparent shadow-none'
                  : isMe
                    ? 'bg-indigo-500 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/20 shadow-sm px-4 py-2.5'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm shadow-sm px-4 py-2.5'
                }`}>
                {msg.messageType === 'image' && msg.imageUrl ? (
                  <img
                    src={msg.imageUrl}
                    alt="Message attachment"
                    className={`rounded-lg max-w-full max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity border border-slate-200/50 ${msg.content?.trim() ? 'mb-2' : ''}`}
                    onClick={() => setSelectedImage(msg.imageUrl!)}
                  />
                ) : null}
                {msg.content && renderMessageContent(msg.content)}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};
