import type { MemberData } from '../types/workspace.types';

export const getMemberDisplayName = (member: MemberData): string => {
  return member.user?.name || member.userName || 'Unknown User';
};

export const getMemberEmail = (member: MemberData): string => {
  return member.user?.email || member.userEmail || '';
};

export const getMemberAvatar = (member: MemberData): string | undefined => {
  return member.user?.profileImage || undefined;
};

export const getMemberInitial = (member: MemberData): string => {
  const name = getMemberDisplayName(member);
  return name.charAt(0).toUpperCase() || 'U';
};
