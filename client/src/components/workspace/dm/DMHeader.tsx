import { Info } from 'lucide-react';
import { DMAvatar } from './DMAvatar';

interface DMHeaderProps {
  otherUser?: { id?: string; name?: string; profileImage?: string };
  otherUserTyping: boolean;
}

export const DMHeader = ({ otherUser, otherUserTyping }: DMHeaderProps) => {
  return (
    <div className="h-14 border-b border-slate-200 flex items-center justify-between px-5 shrink-0 bg-white z-10">
      <div className="flex items-center gap-3">
        <DMAvatar user={{ ...otherUser, id: otherUser?.id }} size="sm" />
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">
            {otherUser?.name || 'Direct Message'}
          </p>
          {otherUserTyping ? (
            <p className="text-xs text-blue-500 font-medium animate-pulse">Typing...</p>
          ) : (
            <p className="text-xs text-emerald-500 font-medium">● Online</p>
          )}
        </div>
      </div>
      <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="View Profile">
        <Info className="w-5 h-5" />
      </button>
    </div>
  );
};
