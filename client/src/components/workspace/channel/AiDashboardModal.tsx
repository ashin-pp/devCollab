import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  Bot,
  X,
  CheckSquare,
  Bell,
  Calendar,
  ListTodo,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  Check,
  Megaphone,
  Video,
  RefreshCw,
  ArrowRight,
  Trash2,
  UserRound,
} from 'lucide-react';
import { AiService } from '../../../api/ai/ai.service';
import type {
  AIDashboardData,
  AIDashboardNotification,
  AIDashboardPerson,
  AIDashboardReminder,
  AIDashboardSchedule,
  AIDashboardTask,
} from '../../../types/ai.types';
import type { RootState } from '../../../store';

export type AiTab = 'tasks' | 'reminders' | 'notifications' | 'schedule';

const PersonChip: React.FC<{ person?: AIDashboardPerson }> = ({ person }) => {
  if (!person?.name) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
      <UserRound className="h-3 w-3 text-slate-400" />
      <span className="text-slate-400">{person.label}</span>
      {person.name}
    </span>
  );
};

const CLEAR_COPY: Record<
  AiTab,
  { title: string; text: string; confirm: string; toast: (n: number) => string }
> = {
  tasks: {
    title: 'Clear done tasks?',
    text: 'Removes completed tasks from this workspace for you. Open and in-progress tasks stay.',
    confirm: 'Clear done',
    toast: (n) => (n === 0 ? 'No done tasks to clear' : `Cleared ${n} done task${n === 1 ? '' : 's'}`),
  },
  reminders: {
    title: 'Clear reminders?',
    text: 'Removes all of your reminders in this workspace.',
    confirm: 'Clear reminders',
    toast: (n) => (n === 0 ? 'No reminders to clear' : `Cleared ${n} reminder${n === 1 ? '' : 's'}`),
  },
  notifications: {
    title: 'Clear notifies?',
    text: 'Removes AI /notify messages for you in this workspace.',
    confirm: 'Clear notifies',
    toast: (n) => (n === 0 ? 'No notifies to clear' : `Cleared ${n} notify${n === 1 ? '' : 's'}`),
  },
  schedule: {
    title: 'Clear past meetings?',
    text: 'Removes meetings that have already ended. Upcoming schedule stays.',
    confirm: 'Clear past',
    toast: (n) =>
      n === 0 ? 'No past meetings to clear' : `Cleared ${n} past meeting${n === 1 ? '' : 's'}`,
  },
};

interface AiDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AiTab;
  workspaceId: string;
}

const formatWhen = (value: string | Date | undefined) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const isDone = (status: string) => {
  const s = status.toLowerCase();
  return s === 'done' || s === 'completed';
};

const statusTone = (status: string) => {
  const s = status.toLowerCase();
  if (isDone(s)) return 'bg-emerald-50 text-emerald-700';
  if (s === 'in_progress') return 'bg-amber-50 text-amber-700';
  if (s === 'cancelled') return 'bg-slate-100 text-slate-600';
  return 'bg-sky-50 text-sky-700';
};

const reminderMeta = (remindAt: string | Date, sent: boolean) => {
  if (sent) return { label: 'Sent', tone: 'bg-emerald-50 text-emerald-700' };
  if (new Date(remindAt).getTime() <= Date.now()) {
    return { label: 'Due now', tone: 'bg-rose-50 text-rose-700' };
  }
  return { label: 'Upcoming', tone: 'bg-amber-50 text-amber-700' };
};

const EmptyPanel: React.FC<{
  icon: React.ReactNode;
  title: string;
  hint: string;
  command?: string;
}> = ({ icon, title, hint, command }) => (
  <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-white to-slate-50/80 px-6 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/80">
      {icon}
    </div>
    <p className="text-base font-semibold text-slate-800">{title}</p>
    <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">{hint}</p>
    {command && (
      <code className="mt-4 rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-100">
        {command}
      </code>
    )}
  </div>
);

const PanelHeader: React.FC<{
  title: string;
  description: string;
  countLabel?: string;
}> = ({ title, description, countLabel }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-0.5 text-sm text-slate-500">{description}</p>
    </div>
    {countLabel && (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        {countLabel}
      </span>
    )}
  </div>
);

const TaskCard: React.FC<{
  task: AIDashboardTask;
  completing: boolean;
  onComplete: () => void;
}> = ({ task, completing, onComplete }) => {
  const done = isDone(task.status);
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:shadow-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          done ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'
        }`}
      >
        {done ? <Check className="h-5 w-5" /> : <CheckSquare className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold text-slate-900 ${done ? 'line-through opacity-50' : ''}`}>
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <PersonChip person={task.person} />
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            Due {formatWhen(task.dueDate)}
          </span>
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusTone(task.status)}`}>
            {task.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
      {!done && (
        <button
          type="button"
          disabled={completing}
          onClick={onComplete}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {completing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Done
        </button>
      )}
    </article>
  );
};

export const AiDashboardModal: React.FC<AiDashboardModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'tasks',
  workspaceId,
}) => {
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [activeTab, setActiveTab] = useState<AiTab>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AIDashboardData | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab);
  }, [isOpen, defaultTab]);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await AiService.getDashboard(workspaceId);
      setData(res.data.data);
    } catch {
      setError('Could not load AI dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!isOpen || !workspaceId) return;
    void load();
  }, [isOpen, workspaceId, load]);

  const markDone = async (taskId: string) => {
    setCompletingId(taskId);
    try {
      await AiService.updateTaskStatus(taskId, workspaceId, 'done');
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, status: 'done' } : t)),
          counts: {
            ...prev.counts,
            tasks: Math.max(0, prev.counts.tasks - 1),
          },
        };
      });
    } catch {
      setError('Could not update task status.');
    } finally {
      setCompletingId(null);
    }
  };

  const clearActiveTab = async () => {
    const copy = CLEAR_COPY[activeTab];
    const result = await Swal.fire({
      title: copy.title,
      text: copy.text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: copy.confirm,
    });
    if (!result.isConfirmed) return;

    setClearing(true);
    setError(null);
    try {
      const res = await AiService.clearDashboardTab(workspaceId, activeTab);
      const cleared = Number(res.data?.data?.cleared ?? 0);
      toast.success(copy.toast(cleared));
      await load();
    } catch {
      setError('Could not clear this section.');
      toast.error('Could not clear this section.');
    } finally {
      setClearing(false);
    }
  };

  const tasks = data?.tasks ?? [];
  const reminders = data?.reminders ?? [];
  const schedules = data?.schedules ?? [];
  const notifications = data?.notifications ?? [];

  const assignedToYou = useMemo(
    () => (currentUserId ? tasks.filter((t) => t.assignedTo === currentUserId) : tasks),
    [tasks, currentUserId]
  );
  const createdByYou = useMemo(
    () =>
      currentUserId
        ? tasks.filter((t) => t.createdBy === currentUserId && t.assignedTo !== currentUserId)
        : [],
    [tasks, currentUserId]
  );

  const navItems = useMemo(
    () => [
      {
        id: 'tasks' as const,
        label: 'Tasks',
        hint: 'Assigned & created',
        icon: CheckSquare,
        count: data?.counts.tasks ?? 0,
        accent: 'bg-sky-500',
      },
      {
        id: 'reminders' as const,
        label: 'Reminders',
        hint: 'Timed follow-ups',
        icon: Bell,
        count: data?.counts.reminders ?? 0,
        accent: 'bg-amber-500',
      },
      {
        id: 'notifications' as const,
        label: 'Notifies',
        hint: 'From /notify',
        icon: Megaphone,
        count: data?.counts.notifications ?? 0,
        accent: 'bg-rose-500',
      },
      {
        id: 'schedule' as const,
        label: 'Schedule',
        hint: 'Google Meet 1:1s',
        icon: Calendar,
        count: data?.counts.schedules ?? 0,
        accent: 'bg-emerald-500',
      },
    ],
    [data?.counts]
  );

  if (!isOpen) return null;

  const activeMeta = navItems.find((n) => n.id === activeTab) ?? navItems[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-3 sm:p-6">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative flex h-[min(860px,92vh)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-[#F4F7FB] shadow-2xl shadow-slate-950/20">
        {/* Sidebar */}
        <aside className="hidden w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white md:flex">
          <div className="border-b border-slate-100 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md shadow-slate-900/25">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">AI Assistant</p>
                <p className="text-xs text-slate-500">Your workspace hub</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Sections
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    active
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      active ? 'bg-white/10' : 'bg-slate-100 text-slate-500 group-hover:bg-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className={`block text-[11px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                      {item.hint}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
              <p className="text-xs font-semibold text-slate-700">Quick tip</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Type <span className="font-semibold text-slate-700">/task</span>,{' '}
                <span className="font-semibold text-slate-700">/remind</span>,{' '}
                <span className="font-semibold text-slate-700">/notify</span> or{' '}
                <span className="font-semibold text-slate-700">/schedule</span> in any channel.
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-3.5 backdrop-blur sm:px-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${activeMeta.accent}`} />
                <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                  {activeMeta.label}
                </h2>
              </div>
              <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{activeMeta.hint}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => void clearActiveTab()}
                disabled={loading || clearing || !data}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                title={CLEAR_COPY[activeTab].title}
              >
                {clearing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Clear</span>
              </button>
              <button
                type="button"
                onClick={() => void load()}
                disabled={loading || clearing}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Mobile nav */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200/80 bg-white px-3 py-2 md:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                  <span className={active ? 'text-white/70' : 'text-slate-400'}>{item.count}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {loading && !data && (
              <div className="flex h-72 flex-col items-center justify-center text-slate-400">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-sky-500" />
                <p className="text-sm font-medium">Loading your AI workspace…</p>
              </div>
            )}

            {!loading && error && !data && (
              <EmptyPanel
                icon={<AlertCircle className="h-6 w-6 text-rose-400" />}
                title={error}
                hint="Check your connection, then refresh."
              />
            )}

            {data && !error && activeTab === 'tasks' && (
              <div className="space-y-8">
                <section>
                  <PanelHeader
                    title="Assigned to you"
                    description="Tasks that need your attention"
                    countLabel={`${assignedToYou.length} task${assignedToYou.length === 1 ? '' : 's'}`}
                  />
                  {assignedToYou.length === 0 ? (
                    <EmptyPanel
                      icon={<ListTodo className="h-6 w-6" />}
                      title="Inbox is clear"
                      hint="When someone assigns you work with /task, it lands here."
                      command="/task @you Review the PR"
                    />
                  ) : (
                    <div className="space-y-2.5">
                      {assignedToYou.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          completing={completingId === task.id}
                          onComplete={() => void markDone(task.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <PanelHeader
                    title="Created by you"
                    description="Work you assigned to others"
                    countLabel={`${createdByYou.length} task${createdByYou.length === 1 ? '' : 's'}`}
                  />
                  {createdByYou.length === 0 ? (
                    <EmptyPanel
                      icon={<ArrowRight className="h-6 w-6" />}
                      title="Nothing delegated yet"
                      hint="Assign work to teammates from any channel."
                      command="/task @name Ship the landing page"
                    />
                  ) : (
                    <div className="space-y-2.5">
                      {createdByYou.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          completing={completingId === task.id}
                          onComplete={() => void markDone(task.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {data && !error && activeTab === 'reminders' && (
              <div>
                <PanelHeader
                  title="Your reminders"
                  description="Nudges the AI will surface at the right time"
                  countLabel={`${reminders.length} total`}
                />
                {reminders.length === 0 ? (
                  <EmptyPanel
                    icon={<Bell className="h-6 w-6" />}
                    title="No reminders set"
                    hint="Ask the assistant to ping you later."
                    command="/remind me in 20 minutes to check deploy"
                  />
                ) : (
                  <div className="space-y-2.5">
                    {reminders.map((reminder: AIDashboardReminder) => {
                      const meta = reminderMeta(reminder.remindAt, reminder.isSent);
                      return (
                        <article
                          key={reminder.id}
                          className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                        >
                          <div className="flex min-w-0 gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                              <Bell className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{reminder.content}</p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <PersonChip person={reminder.person} />
                                <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatWhen(reminder.remindAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.tone}`}>
                            {meta.label}
                          </span>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {data && !error && activeTab === 'notifications' && (
              <div>
                <PanelHeader
                  title="AI notifies"
                  description="Direct pings sent to you with /notify"
                  countLabel={`${notifications.length} message${notifications.length === 1 ? '' : 's'}`}
                />
                {notifications.length === 0 ? (
                  <EmptyPanel
                    icon={<Megaphone className="h-6 w-6" />}
                    title="No notifies yet"
                    hint="When a teammate pings you through the AI, you’ll see it here."
                    command='/notify @you "Can you review this?"'
                  />
                ) : (
                  <div className="space-y-2.5">
                    {notifications.map((n: AIDashboardNotification) => (
                      <article
                        key={n.id || `${n.title}-${String(n.createdAt)}`}
                        className={`rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
                          n.isRead ? 'border-slate-200/90' : 'border-sky-200 ring-1 ring-sky-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                            <Megaphone className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                              <PersonChip person={n.person} />
                              {!n.isRead && (
                                <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">{n.message}</p>
                            <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="h-3.5 w-3.5" />
                              {formatWhen(n.createdAt)}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {data && !error && activeTab === 'schedule' && (
              <div>
                <PanelHeader
                  title="1:1 schedule"
                  description="Meetings you’re organizing or invited to"
                  countLabel={`${schedules.length} meeting${schedules.length === 1 ? '' : 's'}`}
                />
                {schedules.length === 0 ? (
                  <EmptyPanel
                    icon={<Calendar className="h-6 w-6" />}
                    title="No meetings yet"
                    hint="Schedule a Google Meet 1:1 from the channel."
                    command="/schedule @name tomorrow 3pm"
                  />
                ) : (
                  <div className="space-y-2.5">
                    {schedules.map((item: AIDashboardSchedule) => (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Video className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                <div className="mt-1.5">
                                  <PersonChip person={item.person} />
                                </div>
                              </div>
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                                {item.status}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-500">
                              {formatWhen(item.startsAt)} → {formatWhen(item.endsAt)}
                            </p>
                            {item.meetLink ? (
                              <a
                                href={item.meetLink}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                              >
                                <Video className="h-3.5 w-3.5" />
                                Join Google Meet
                                <ExternalLink className="h-3 w-3 opacity-70" />
                              </a>
                            ) : (
                              <p className="mt-3 text-xs text-slate-400">Meet link unavailable</p>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && data && (
              <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 ring-1 ring-rose-100">
                {error}
              </p>
            )}
          </div>

          {/* Footer stats */}
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-slate-100"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${item.accent}`} />
                  {item.count} {item.label.toLowerCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:text-sm"
            >
              Close
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};
