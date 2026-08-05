import { X } from 'lucide-react';

interface WorkspaceLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  maxWorkspaces?: number;
}

export const WorkspaceLimitModal = ({
  isOpen,
  onClose,
  onUpgrade,
  maxWorkspaces,
}: WorkspaceLimitModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-limit-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="workspace-limit-title" className="text-lg font-bold text-slate-900">
              Workspace limit reached
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {typeof maxWorkspaces === 'number'
                ? `Your current plan allows up to ${maxWorkspaces} workspace${maxWorkspaces === 1 ? '' : 's'}. Upgrade to create more.`
                : "Your plan's workspace limit has been reached. Upgrade to create more workspaces."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onUpgrade}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};
