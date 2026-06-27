import { useState, useEffect, useCallback } from 'react';
import { ChannelService } from '../api/workspace/channel.service';
import type { ChannelData, ChannelMemberData } from '../types/channel.types';

export const useWorkspaceChannels = (workspaceId?: string) => {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await ChannelService.getWorkspaceChannels(workspaceId);
      setChannels(res.data?.data || []);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Failed to fetch channels');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  return { channels, setChannels, loading, error, refetch: fetchChannels };
};

export const useChannelMembers = (workspaceId?: string, channelId?: string) => {
  const [members, setMembers] = useState<ChannelMemberData[]>([]);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!workspaceId || !channelId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await ChannelService.getMembers(workspaceId, channelId);
      const membersData = res.data?.data || [];
      setMembers(membersData);

      const map: Record<string, string> = {};
      membersData.forEach((member: ChannelMemberData) => {
        if (member.user?.profileImage) {
          map[member.userId] = member.user.profileImage;
        }
      });
      setImageMap(map);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Failed to fetch channel members');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, channelId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, setMembers, imageMap, setImageMap, loading, error, refetch: fetchMembers };
};
