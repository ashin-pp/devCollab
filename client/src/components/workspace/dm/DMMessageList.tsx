import { format, isToday } from 'date-fns';
import { Loader2, Check, CheckCheck } from 'lucide-react';
import { DMAvatar } from './DMAvatar';
import type { DirectMessage } from '../../../types/dm.types';

const renderMessageContent = (content: string) => {
  return <span dangerouslySetInnerHTML={{ __html: content }} />;
};

interface DMMessageListProps {
  messages: DirectMessage[];
  isLoading: boolean;
  currentUser: { id?: string; name?: string; profileImage?: string } | null;
  otherUser?: { id?: string; name?: string; profileImage?: string };
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  setSelectedImage: (url: string) => void;
}

export const DMMessageList = ({
  messages,
  isLoading,
  currentUser,
  otherUser,
  messagesEndRef,
  setSelectedImage
}: DMMessageListProps) => {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <DMAvatar user={{ ...otherUser }} size="lg" />
          <h3 className="mt-4 text-base font-bold text-slate-900">{otherUser?.name}</h3>
          <p className="text-sm text-slate-500 mt-1">This is the beginning of your conversation.</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {messages.map((msg, index) => {
            const isMine = msg.senderId === currentUser?.id;
            const prevMsg = messages[index - 1];
            const isGrouped = prevMsg?.senderId === msg.senderId;
            const msgDate = msg.createdAt ? new Date(msg.createdAt) : new Date();
            const prevDate = prevMsg?.createdAt ? new Date(prevMsg.createdAt) : new Date(0);
            const showTimestamp =
              !prevMsg ||
              msgDate.getTime() - prevDate.getTime() > 5 * 60 * 1000;

            return (
              <div key={msg.id || index}>
                {/* Date divider */}
                {showTimestamp && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
                      {isToday(msgDate)
                        ? `Today at ${format(msgDate, 'h:mm a')}`
                        : format(msgDate, 'MMM d, h:mm a')}
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
                    <DMAvatar user={isMine ? currentUser : { ...otherUser, id: otherUser?.id }} size="sm" />
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
                      className={`text-sm leading-relaxed ${
                        msg.messageType === 'image' && !msg.content?.trim()
                          ? 'bg-transparent shadow-none'
                          : isMine
                            ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm shadow-sm px-3.5 py-2'
                            : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-2xl rounded-bl-sm px-3.5 py-2'
                      }`}
                    >
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
                    <div
                      className={`flex items-center gap-1 px-1 text-[10px] text-slate-400 transition-opacity ${
                        isMine ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span>{msg.createdAt ? format(msgDate, 'h:mm a') : ''}</span>
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
  );
};
