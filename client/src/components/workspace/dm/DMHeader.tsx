import { Info, Loader2, Video } from 'lucide-react';
import { DMAvatar } from './DMAvatar';

interface DMHeaderProps {
  otherUser?: { id?: string; name?: string; profileImage?: string };
  otherUserTyping: boolean;
  onVideoCall?: () => void;
  isFindingCall?: boolean;
  onInfo?: () => void;
}

export const DMHeader = ({
  otherUser,
  otherUserTyping,
  onVideoCall,
  isFindingCall = false,
  onInfo,
}: DMHeaderProps) => {
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
      <div className="flex items-center gap-1">
        {onVideoCall ? (
          <button
            type="button"
            onClick={onVideoCall}
            disabled={isFindingCall}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
            title="Start video call"
            aria-label="Start video call"
          >
            {isFindingCall ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Video className="w-5 h-5" />
            )}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onInfo}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
          title="Person details"
          aria-label="Person details"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
