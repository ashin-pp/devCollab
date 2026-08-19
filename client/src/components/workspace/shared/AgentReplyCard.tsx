import { Bot } from 'lucide-react';
import { renderMessageContent } from '../../../utils/renderMessageContent';
import {
  extractCallCreator,
  extractCallScheduleId,
  stripCallLinks,
} from '../../../utils/callLink.utils';
import { CallInviteCta } from './CallInviteCta';

interface AgentReplyCardProps {
  content: string;
  timestamp?: string;
  className?: string;
  creatorName?: string | null;
}

export const AgentReplyCard = ({
  content,
  timestamp,
  className = '',
  creatorName,
}: AgentReplyCardProps) => {
  const scheduleId = extractCallScheduleId(content);
  const displayContent = scheduleId ? stripCallLinks(content) : content;
  const createdBy = extractCallCreator(content) || creatorName || null;

  return (
    <div
      className={`relative w-full max-w-[min(100%,28rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/80 to-indigo-50/40 shadow-sm ${className}`}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-sky-500" />

      <div className="pl-4 pr-4 py-3.5">
        <div className="mb-2.5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/15">
            <Bot className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-900">Agentic AI</span>
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600 ring-1 ring-indigo-100">
                AI Agent
              </span>
            </div>
            {timestamp ? (
              <p className="mt-0.5 text-[11px] text-slate-500">{timestamp}</p>
            ) : null}
          </div>
        </div>

        {displayContent ? (
          <div className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap">
            {renderMessageContent(displayContent)}
          </div>
        ) : null}

        {scheduleId ? (
          <CallInviteCta scheduleId={scheduleId} creatorName={createdBy} />
        ) : null}
      </div>
    </div>
  );
};
