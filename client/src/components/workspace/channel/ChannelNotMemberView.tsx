import { Lock, Hash, Plus } from 'lucide-react';
import type { ChannelData } from '../../../types/channel.types';

interface ChannelNotMemberViewProps {
  currentChannel: ChannelData;
  handleJoinChannel: () => void;
  isJoining?: boolean;
}

export const ChannelNotMemberView = ({ currentChannel, handleJoinChannel, isJoining = false }: ChannelNotMemberViewProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${currentChannel.privacy === 'private' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
        {currentChannel.privacy === 'private' ? <Lock className="w-8 h-8" /> : <Hash className="w-8 h-8" />}
      </div>
      <div className="flex items-center gap-2 mb-2">
        {currentChannel.privacy === 'private' ? (
          <Lock className="w-5 h-5 text-orange-500" />
        ) : (
          <Hash className="w-5 h-5 text-blue-600" />
        )}
        <h2 className="text-2xl font-bold text-slate-900">{currentChannel.name}</h2>
        {currentChannel.privacy === 'private' ? (
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-orange-100 text-orange-700">
            Private
          </span>
        ) : (
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-100 text-blue-700">
            Public
          </span>
        )}
      </div>
      <p className="text-slate-500 text-center max-w-md mb-8">
        {currentChannel.description || "You are not a member of this channel. Join to see messages and participate in the conversation."}
      </p>

      {currentChannel.hasPendingRequest ? (
        <button
          disabled
          className="px-6 py-2.5 bg-slate-200 text-slate-500 font-semibold rounded-xl flex items-center gap-2 cursor-not-allowed"
        >
          <Lock className="w-5 h-5" /> Request Pending
        </button>
      ) : (
        <button
          onClick={handleJoinChannel}
          disabled={isJoining}
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          {isJoining ? 'Joining…' : currentChannel.privacy === 'private' ? 'Request to Join' : 'Join Channel'}
        </button>
      )}
    </div>
  );
};
