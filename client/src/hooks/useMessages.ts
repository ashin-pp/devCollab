import { useState, useCallback } from 'react';
import { MessageService } from '../api/workspace/message.service';
import type { MessageData } from '../types/channel.types';

export const useChannelMessages = (workspaceId?: string, channelId?: string) => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchMessages = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (!workspaceId || !channelId) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await MessageService.getChannelMessages(workspaceId, channelId, page, 20);
      
      let newMessages: MessageData[] = [];
      let pagination = { total: 0, page: 1, totalPages: 1 };
      
      if (res.data?.data?.messages) {
        newMessages = res.data.data.messages.reverse();
        pagination = res.data.data.pagination;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        newMessages = res.data.data.reverse();
        pagination = { total: res.data.data.length, page: 1, totalPages: 1 };
      } else if (Array.isArray(res.data)) {
        newMessages = res.data.reverse();
        pagination = { total: res.data.length, page: 1, totalPages: 1 };
      }
      
      setMessages(prev => reset ? newMessages : [...newMessages, ...prev]);
      setTotalMessages(pagination.total || newMessages.length);
      setHasMore(page < (pagination.totalPages || 1));
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
