import { format } from 'date-fns';
import { Lock } from 'lucide-react';
import type { ThreadMessageItemProps } from '../../../types/component.types';
import { renderMessageContent } from '../../../utils/renderMessageContent';

export const ThreadMessageItem = ({
  msg,
  user,
  memberImagesMap,
  setSelectedImage,
  compact = false
}: ThreadMessageItemProps) => {
  const isMe = msg.senderId === user?.id;
  const senderInitial = msg.senderName?.[0]?.toUpperCase() || 'U';
  const senderImage = isMe
    ? user?.profileImage
    : (memberImagesMap[msg.senderId] || msg.senderImage);
  const avatarSize = compact ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';

  return (
    <div className="flex gap-3">
      <div className={`${avatarSize} rounded-md flex items-center justify-center font-bold shrink-0 overflow-hidden ${isMe ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
        {senderImage ? (
          <img src={senderImage} alt={msg.senderName || 'User'} className="w-full h-full object-cover" />
        ) : (
          <span>{senderInitial}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="font-bold text-slate-900 text-sm">{isMe ? 'You' : (msg.senderName || 'User')}</span>
          <span className="text-[10px] text-slate-500">
            {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : 'Now'}
          </span>
          {msg.replyVisibility === 'author' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
              <Lock className="w-2.5 h-2.5" />
              Only author
            </span>
          )}
        </div>
        {msg.messageType === 'image' && msg.imageUrl ? (
          <img
            src={msg.imageUrl}
            alt="Message attachment"
            className="rounded-lg max-w-full max-h-[220px] object-contain cursor-pointer hover:opacity-90 transition-opacity border border-slate-200/50 mb-1"
            onClick={() => setSelectedImage(msg.imageUrl!)}
          />
        ) : null}
        {msg.content && (
          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {renderMessageContent(msg.content)}
          </div>
        )}
      </div>
    </div>
  );
};
