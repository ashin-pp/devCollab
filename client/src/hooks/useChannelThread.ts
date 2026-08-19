import { useEffect, useRef, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { MessageService } from '../api/workspace/message.service';
import { useThreadReplies } from './useMessages';
import type { MessageData, ReplyVisibility } from '../types/channel.types';
import type { User } from '../types/auth.types';
import { getMessageId } from '../utils/message.utils';

interface UseChannelThreadParams {
  workspaceId?: string;
  channelId?: string;
  user: User | null;
  socket: Socket | null;
  setMessages: React.Dispatch<React.SetStateAction<MessageData[]>>;
  onOpenMembersClose?: () => void;
}

export const useChannelThread = ({
  workspaceId,
  channelId,
  user,
  socket,
  setMessages,
  onOpenMembersClose
}: UseChannelThreadParams) => {
  const [showThread, setShowThread] = useState(false);
  const [activeThreadRootId, setActiveThreadRootId] = useState<string | null>(null);
  const processedThreadReplyIdsRef = useRef<Set<string>>(new Set());

  const {
    rootMessage: threadRootMessage,
    setRootMessage: setThreadRootMessage,
    replies: threadReplies,
    setReplies: setThreadReplies,
    loading: isLoadingThread,
    fetchThread,
    resetThread
  } = useThreadReplies(workspaceId, channelId);

  const bumpThreadReplyCount = useCallback((rootId: string, replyId: string) => {
    if (!rootId || !replyId || processedThreadReplyIdsRef.current.has(replyId)) return;
    processedThreadReplyIdsRef.current.add(replyId);
    setMessages(prev => prev.map(m =>
      getMessageId(m) === rootId
        ? { ...m, replyCount: (m.replyCount || 0) + 1 }
        : m
    ));
  }, [setMessages]);

  const handleCloseThread = useCallback(() => {
    setShowThread(false);
    setActiveThreadRootId(null);
    resetThread();
  }, [resetThread]);

  const handleOpenThread = useCallback(async (message: MessageData) => {
    const rootId = getMessageId(message);
    if (!rootId) return;

    onOpenMembersClose?.();
    setActiveThreadRootId(rootId);
    setThreadRootMessage(message);
    setShowThread(true);

    const data = await fetchThread(rootId);
    if (data?.rootMessage) {
      setMessages(prev => prev.map(m =>
        getMessageId(m) === rootId
          ? { ...m, replyCount: data.rootMessage.replyCount || 0 }
          : m
      ));
    }
  }, [fetchThread, onOpenMembersClose, setMessages, setThreadRootMessage]);

  const handleSendThreadReply = useCallback(async (content: string, replyVisibility: ReplyVisibility) => {
    if (!workspaceId || !channelId || !user || !activeThreadRootId) return;

    try {
      const res = await MessageService.sendMessage(workspaceId, channelId, {
        content,
        messageType: 'text',
        parentMessageId: activeThreadRootId,
        replyVisibility
      });

      const newMsg = {
        ...res.data?.data,
        senderName: user.name,
      } as MessageData;

      const replyId = getMessageId(newMsg);
      bumpThreadReplyCount(activeThreadRootId, replyId);

      setThreadReplies(prev => {
        if (prev.some(m => getMessageId(m) === replyId)) return prev;
        return [...prev, newMsg];
      });

      socket?.emit('new_message', newMsg);
    } catch (error) {
      console.error('Failed to send thread reply', error);
      import('react-hot-toast').then(m => m.default.error('Failed to send reply'));
      throw error;
    }
  }, [workspaceId, channelId, user, activeThreadRootId, bumpThreadReplyCount, setThreadReplies, socket]);

  const handleThreadReplyReceived = useCallback((newMsg: MessageData) => {
    if (!newMsg.threadRootId) return;

    const replyId = getMessageId(newMsg);
    bumpThreadReplyCount(newMsg.threadRootId, replyId);

    if (activeThreadRootId && newMsg.threadRootId === activeThreadRootId) {
      setThreadReplies(prev => {
        if (prev.some(m => getMessageId(m) === replyId)) return prev;
        return [...prev, newMsg];
      });
    }
  }, [activeThreadRootId, bumpThreadReplyCount, setThreadReplies]);

  useEffect(() => {
    handleCloseThread();
    processedThreadReplyIdsRef.current.clear();
  }, [channelId]);

  return {
    showThread,
    activeThreadRootId,
    threadRootMessage,
    threadReplies,
    isLoadingThread,
    handleOpenThread,
    handleCloseThread,
    handleSendThreadReply,
    handleThreadReplyReceived
  };
};
