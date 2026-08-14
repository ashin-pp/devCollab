import { PhoneOff, Video } from 'lucide-react';

export type IncomingCallPayload = {
  scheduleId: string;
  meetLink?: string;
  title?: string;
  conversationId?: string;
  workspaceId?: string;
  callerId: string;
  callerName: string;
  callerImage?: string;
};

interface IncomingCallModalProps {
  call: IncomingCallPayload;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal = ({ call, onAccept, onDecline }: IncomingCallModalProps) => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pb-8 pt-10 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Incoming call</p>
          <div className="mx-auto mt-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-4 ring-white/30">
            {call.callerImage ? (
              <img src={call.callerImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold">{(call.callerName || '?').slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <p className="mt-4 text-xl font-bold">{call.callerName}</p>
          <p className="mt-1 text-sm text-white/80">{call.title || 'Video call'}</p>
          <div className="mt-4 flex justify-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:0.2s]" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-8 px-6 py-6">
          <button
            type="button"
            onClick={onDecline}
            className="flex flex-col items-center gap-2 text-slate-600"
          >
            <span className="rounded-full bg-rose-600 p-4 text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500">
              <PhoneOff className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold">Decline</span>
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex flex-col items-center gap-2 text-slate-600"
          >
            <span className="rounded-full bg-emerald-500 p-4 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400">
              <Video className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold">Join</span>
          </button>
        </div>
      </div>
    </div>
  );
};
