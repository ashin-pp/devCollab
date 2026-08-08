import { useEffect, useRef, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { ChevronDown, MessageSquare } from 'lucide-react';
import type { ChannelMessageListProps } from '../../../types/component.types';
import { renderMessageContent } from '../../../utils/renderMessageContent';
import { getMessageId } from '../../../utils/message.utils';
import { isAgentMessage } from '../../../utils/agentMessage.utils';
import { AgentReplyCard } from '../shared/AgentReplyCard';

const NEAR_BOTTOM_PX = 100;

export const ChannelMessageList = ({
  messages,
  user,
  memberImagesMap,
  hasMoreMessages,
  isLoadingMessages,
  loadMoreMessages,
  setSelectedImage,
  onOpenThread,
  channelId,
  initialUnreadCount = 0,
  onMarkAsRead,
  scrollToBottomSignal = 0
}: ChannelMessageListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialScrollDoneRef = useRef(false);
  const hasMarkedReadRef = useRef(false);
  const isNearBottomRef = useRef(true);
  const prevLastMessageIdRef = useRef('');
  const prevScrollHeightRef = useRef(0);
  const loadingOlderRef = useRef(false);

  const [showJumpButton, setShowJumpButton] = useState(false);
  const [pendingNewCount, setPendingNewCount] = useState(0);
  const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);

  const markReadIfNeeded = useCallback(() => {
    if (hasMarkedReadRef.current) return;
    hasMarkedReadRef.current = true;
    const latestMessage = messages[messages.length - 1];
    onMarkAsRead?.(latestMessage?.createdAt);
  }, [messages, onMarkAsRead]);

  const scrollToLatest = useCallback((smooth = true) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
    setShowJumpButton(false);
    setPendingNewCount(0);
    isNearBottomRef.current = true;
    markReadIfNeeded();
  }, [markReadIfNeeded]);

  const updateNearBottomState = useCallback(() => {
    const el = listRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom <= NEAR_BOTTOM_PX;
    isNearBottomRef.current = nearBottom;

    if (nearBottom) {
      setShowJumpButton(false);
      setPendingNewCount(0);
      markReadIfNeeded();
    } else {
      setShowJumpButton(true);
    }
  }, [markReadIfNeeded]);

  // Reset when switching channels
  useEffect(() => {
    initialScrollDoneRef.current = false;
    hasMarkedReadRef.current = false;
    isNearBottomRef.current = true;
    prevLastMessageIdRef.current = '';
    setShowJumpButton(false);
    setPendingNewCount(0);
    setFirstUnreadId(null);
  }, [channelId]);

  // Initial position: latest, or last-read if there are unreads
  useEffect(() => {
    if (!listRef.current || messages.length === 0 || initialScrollDoneRef.current) return;

    const unread = Math.max(0, initialUnreadCount);
    // Only treat as unread-anchor when we have older (already-read) messages in the loaded page
    const firstUnreadIndex = unread > 0 && unread < messages.length
      ? messages.length - unread
      : -1;

    if (firstUnreadIndex >= 0) {
      const target = messages[firstUnreadIndex];
      const targetId = getMessageId(target);
      setFirstUnreadId(targetId);

      requestAnimationFrame(() => {
        const targetEl = document.getElementById(`channel-msg-${targetId}`);
        if (targetEl && listRef.current) {
          const containerTop = listRef.current.getBoundingClientRect().top;
          const targetTop = targetEl.getBoundingClientRect().top;
          listRef.current.scrollTop += targetTop - containerTop - 24;
        } else {
          listRef.current!.scrollTop = listRef.current!.scrollHeight;
        }
        initialScrollDoneRef.current = true;
        prevLastMessageIdRef.current = getMessageId(messages[messages.length - 1]);
        updateNearBottomState();
      });
      return;
    }

    // If this page is entirely unread, start from the oldest loaded unread
    if (unread > 0 && unread >= messages.length) {
      const target = messages[0];
      const targetId = getMessageId(target);
      setFirstUnreadId(targetId);

      requestAnimationFrame(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = 0;
        initialScrollDoneRef.current = true;
        prevLastMessageIdRef.current = getMessageId(messages[messages.length - 1]);
        updateNearBottomState();
      });
      return;
    }

    // No unread — stay on latest
    requestAnimationFrame(() => {
      if (!listRef.current) return;
      listRef.current.scrollTop = listRef.current.scrollHeight;
      initialScrollDoneRef.current = true;
      prevLastMessageIdRef.current = getMessageId(messages[messages.length - 1]);
      setShowJumpButton(false);
      setPendingNewCount(0);
      isNearBottomRef.current = true;
      markReadIfNeeded();
    });
  }, [messages, initialUnreadCount, markReadIfNeeded, updateNearBottomState]);

  // New messages appended at bottom: stick only if already near bottom
  useEffect(() => {
    if (!messages.length) return;

    const lastId = getMessageId(messages[messages.length - 1]);

    if (!initialScrollDoneRef.current) {
      prevLastMessageIdRef.current = lastId;
      return;
    }

    const appendedAtBottom = lastId !== prevLastMessageIdRef.current;
    prevLastMessageIdRef.current = lastId;

    if (!appendedAtBottom) return;

    if (isNearBottomRef.current) {
      requestAnimationFrame(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
      });
      setPendingNewCount(0);
    } else {
      setShowJumpButton(true);
      setPendingNewCount(prev => prev + 1);
    }
  }, [messages]);

  // Explicit jump signal (e.g. after sending a message)
  useEffect(() => {
    if (!scrollToBottomSignal) return;
    scrollToLatest(true);
  }, [scrollToBottomSignal, scrollToLatest]);

  // Keep viewport stable when older messages are prepended
  useEffect(() => {
    if (!loadingOlderRef.current || isLoadingMessages) return;
    const el = listRef.current;
    if (el && prevScrollHeightRef.current) {
      el.scrollTop += el.scrollHeight - prevScrollHeightRef.current;
    }
    loadingOlderRef.current = false;
    prevScrollHeightRef.current = 0;
  }, [messages, isLoadingMessages]);

  return (
    <div className="flex-1 relative min-h-0">
      <div
        ref={listRef}
        onScroll={updateNearBottomState}
        className="h-full overflow-y-auto p-6 space-y-6 bg-[#f8fafc]"
      >
        {hasMoreMessages && (
          <div className="flex justify-center pb-4">
            <button
              onClick={() => {
                if (listRef.current) {
                  prevScrollHeightRef.current = listRef.current.scrollHeight;
                  loadingOlderRef.current = true;
                }
                loadMoreMessages();
              }}
              disabled={isLoadingMessages}
              className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingMessages ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                'Load older messages'
              )}
            </button>
          </div>
        )}

        {messages.map((msg) => {
          const messageId = getMessageId(msg);
          const isMe = msg.senderId === user?.id;
          const senderInitial = msg.senderName?.[0]?.toUpperCase() || 'U';
          const isSystemMessage = msg.messageType === 'system';
          const replyCount = msg.replyCount || 0;
          const senderImage = isMe
            ? user?.profileImage
            : (memberImagesMap[msg.senderId] || msg.senderImage);
          const isFirstUnread = firstUnreadId === messageId;

          if (isSystemMessage) {
            return (
              <div key={messageId} id={`channel-msg-${messageId}`} className="flex justify-center my-3">
                <div className="text-slate-400 text-xs text-center px-3 py-1 font-medium bg-slate-50/80 rounded-full border border-slate-100">
                  {msg.content}
                </div>
              </div>
            );
          }

          if (isAgentMessage(msg)) {
            return (
              <div key={messageId} id={`channel-msg-${messageId}`}>
                {isFirstUnread && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px bg-red-200 flex-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">
                      New messages
                    </span>
                    <div className="h-px bg-red-200 flex-1" />
                  </div>
                )}
                <div className="flex justify-start">
                  <AgentReplyCard
                    content={msg.content}
                    timestamp={msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : 'Now'}
                  />
                </div>
              </div>
            );
          }

          return (
            <div key={messageId} id={`channel-msg-${messageId}`}>
              {isFirstUnread && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px bg-red-200 flex-1" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">
                    New messages
                  </span>
                  <div className="h-px bg-red-200 flex-1" />
                </div>
              )}

              <div className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''}`}>
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
                  <div className={`relative text-[15px] leading-relaxed whitespace-pre-wrap max-w-[85%] ${
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

                    {onOpenThread && (
                      <button
                        type="button"
                        onClick={() => onOpenThread(msg)}
                        className={`absolute -bottom-3 ${isMe ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-md text-[11px] font-semibold shadow-sm border ${
                          isMe
                            ? 'bg-white text-indigo-600 border-indigo-100'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                        title="Reply in thread"
                      >
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Reply
                        </span>
                      </button>
                    )}
                  </div>

                  {(replyCount > 0 || onOpenThread) && (
                    <button
                      type="button"
                      onClick={() => onOpenThread?.(msg)}
                      className={`mt-3 text-xs font-semibold transition-colors ${
                        replyCount > 0
                          ? 'text-blue-600 hover:text-blue-700'
                          : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-600'
                      }`}
                    >
                      {replyCount > 0
                        ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
                        : 'Reply in thread'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {showJumpButton && (
        <button
          type="button"
          onClick={() => scrollToLatest(true)}
          className={`absolute bottom-4 right-6 z-20 flex items-center gap-1.5 rounded-full border shadow-lg transition-colors ${
            pendingNewCount > 0
              ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 pl-3 pr-2.5 py-2'
              : 'w-10 h-10 bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 justify-center'
          }`}
          title={pendingNewCount > 0 ? 'New messages — jump to latest' : 'Jump to latest message'}
        >
          {pendingNewCount > 0 && (
            <span className="text-xs font-bold whitespace-nowrap">
              {pendingNewCount > 99 ? '99+' : pendingNewCount} new
            </span>
          )}
          <ChevronDown className="w-5 h-5 shrink-0" />
        </button>
      )}
    </div>
  );
};
