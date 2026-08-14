import { Link } from 'react-router-dom';
import { Video } from 'lucide-react';

type Tone = 'light' | 'onDark';

interface CallInviteCtaProps {
  scheduleId: string;
  creatorName?: string | null;
  tone?: Tone;
}

export const CallInviteCta = ({
  scheduleId,
  creatorName,
  tone = 'light',
}: CallInviteCtaProps) => {
  const btn =
    tone === 'onDark'
      ? 'bg-white/15 text-white hover:bg-white/25'
      : 'bg-slate-900 text-white hover:bg-slate-800';
  const meta = tone === 'onDark' ? 'text-white/75' : 'text-slate-500';

  return (
    <div className="mt-2">
      {creatorName ? (
        <p className={`mb-1.5 text-[11px] font-medium ${meta}`}>
          Created by {creatorName}
        </p>
      ) : null}
      <Link
        to={`/call/${scheduleId}`}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${btn}`}
      >
        <Video className="h-3.5 w-3.5" />
        Join video call
      </Link>
    </div>
  );
};
