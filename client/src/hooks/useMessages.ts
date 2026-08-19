import { useState, useCallback, useEffect } from 'react';
import { MessageService } from '../api/workspace/message.service';
import type { MessageData, ThreadRepliesResponse } from '../types/channel.types';

const PAGE_SIZE = 20;

export const useChannelMessages = (workspaceId?: string, channelId?: string) => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setMessages([]);
    setLoading(false);
    setError(null);
    setHasMore(true);
    setTotalMessages(0);
    setCurrentPage(1);
  }, [workspaceId, channelId]);

  const fetchMessages = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (!workspaceId || !channelId) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await MessageService.getChannelMessages(workspaceId, channelId, page, PAGE_SIZE);
      
      let newMessages: MessageData[] = [];
      let pagination: { total?: number; page?: number; totalPages?: number } | null = null;
      
      if (res.data?.data?.messages) {
        newMessages = [...res.data.data.messages].reverse();
        pagination = res.data.data.pagination || null;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        newMessages = [...res.data.data].reverse();
      } else if (Array.isArray(res.data)) {
        newMessages = [...res.data].reverse();
      }

      setMessages(prev => {
        if (reset) return newMessages;

        const existingIds = new Set(prev.map(m => String(m.id || m._id || '')));
        const olderOnly = newMessages.filter(m => {
          const id = String(m.id || m._id || '');
          return id && !existingIds.has(id);
        });
        return [...olderOnly, ...prev];
      });

      if (pagination?.totalPages) {
        setTotalMessages(pagination.total || newMessages.length);
        setHasMore(page < pagination.totalPages);
      } else {
        // API returns a bare page array (no totals). A full page means older messages may exist.
        setHasMore(newMessages.length === PAGE_SIZE);
        setTotalMessages(prev => {
          if (reset) return newMessages.length;
          return prev + newMessages.length;
        });
      }

      setCurrentPage(page);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, channelId]);

  return { 
    messages, 
    setMessages, 
    loading, 
    error, 
    hasMore, 
    totalMessages, 
    currentPage, 
    fetchMessages 
  };
};

export const useThreadReplies = (workspaceId?: string, channelId?: string) => {
  const [rootMessage, setRootMessage] = useState<MessageData | null>(null);
  const [replies, setReplies] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThread = useCallback(async (messageId: string): Promise<ThreadRepliesResponse | undefined> => {
    if (!workspaceId || !channelId || !messageId) return;

    try {
      setLoading(true);
      setError(null);
      const res = await MessageService.getThreadReplies(workspaceId, channelId, messageId);
      const data = res.data?.data as ThreadRepliesResponse | undefined;
      setRootMessage(data?.rootMessage || null);
      setReplies(data?.replies || []);
      return data;
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Failed to fetch thread');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, channelId]);

  const resetThread = useCallback(() => {
    setRootMessage(null);
    setReplies([]);
    setError(null);
  }, []);

  return {
    rootMessage,
    setRootMessage,
    replies,
    setReplies,
    loading,
    error,
    fetchThread,
    resetThread
  };
};
