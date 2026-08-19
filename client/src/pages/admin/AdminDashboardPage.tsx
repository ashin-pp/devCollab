import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Activity, Loader2, Network, Users, Wallet } from 'lucide-react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { AdminService } from '../../api/admin/admin.service';

type PresetDays = 7 | 30;

type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  totalWorkspaces: number;
  activeWorkspaces: number;
  totalRevenue: number;
  currency: string;
  successPayments: number;
  failedPayments: number;
  cancelledPayments: number;
  revenueByDay: Array<{ date: string; amount: number; count: number }>;
  recentPayments: Array<{
    id: string;
    planName: string;
    amount: number;
    currency: string;
    status: string;
    userName?: string;
    userEmail?: string;
    createdAt: string;
  }>;
};

const formatMoney = (amount: number, currency: string) => {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : `${currency} `;
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${symbol}0`;
  return `${symbol}${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
};

const statusTone = (status: string) => {
  if (status === 'success') return 'text-emerald-500';
  if (status === 'failed') return 'text-red-500';
  if (status === 'cancelled') return 'text-amber-500';
  return 'text-slate-400';
};

const toDateInputValue = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const shiftDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const AdminDashboardPage = () => {
  const [preset, setPreset] = useState<PresetDays | 'custom'>(7);
  const [from, setFrom] = useState(() => toDateInputValue(shiftDays(new Date(), -6)));
  const [to, setTo] = useState(() => toDateInputValue(new Date()));
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async (params: { days?: number; from?: string; to?: string }) => {
    setIsLoading(true);
    try {
      const response = await AdminService.getDashboardStats(params);
      const payload = (response.data ?? response) as DashboardStats;
      setStats(payload);
    } catch (err: unknown) {
      let errMsg = 'Failed to load dashboard';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (preset === 'custom') {
      if (!from || !to || from > to) return;
      void fetchStats({ from, to });
      return;
    }
    void fetchStats({ days: preset });
  }, [preset, from, to, fetchStats]);

  const applyPreset = (days: PresetDays) => {
    const end = new Date();
    const start = shiftDays(end, -(days - 1));
    setFrom(toDateInputValue(start));
    setTo(toDateInputValue(end));
    setPreset(days);
  };

  const maxRevenue = useMemo(() => {
    if (!stats?.revenueByDay?.length) return 1;
    return Math.max(1, ...stats.revenueByDay.map((day) => day.amount));
  }, [stats]);

  const chartDayCount = stats?.revenueByDay?.length ?? 0;

  const nowLabel = useMemo(
    () =>
      new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }) + ' UTC',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stats]
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-[#30363d] pb-6">
        <div>
          <h1 className="text-sm font-bold text-slate-400 tracking-widest mb-1">SYSTEM_OVERVIEW</h1>
          <div className="text-xl font-bold text-white tracking-widest">
            NODE_STATUS:{' '}
            <span className="text-amber-500">
              {isLoading ? 'SYNCING…' : 'OPERATIONAL'}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#161b22] border border-[#30363d] p-3 rounded">
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">
              SYSTEM_TIME
            </div>
            <div className="text-sm text-white font-mono">{nowLabel}</div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] p-3 rounded">
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">
              PAYMENTS
            </div>
            <div className="text-sm text-white font-mono">
              {stats ? stats.successPayments : '—'} OK
            </div>
          </div>
        </div>
      </div>

      {isLoading && !stats ? (
        <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          Loading dashboard…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="TOTAL_WORKSPACES"
              value={stats?.totalWorkspaces ?? 0}
              hint={`${stats?.activeWorkspaces ?? 0} ACTIVE`}
              icon={<Network className="w-8 h-8" />}
            />
            <StatCard
              label="TOTAL_USERS"
              value={stats?.totalUsers ?? 0}
              hint={`${stats?.activeUsers ?? 0} ACTIVE`}
              icon={<Users className="w-8 h-8" />}
            />
            <StatCard
              label="SUCCESS_PAYMENTS"
              value={stats?.successPayments ?? 0}
              hint={`${stats?.failedPayments ?? 0} FAILED · ${stats?.cancelledPayments ?? 0} CANCELLED`}
              icon={<Activity className="w-8 h-8" />}
            />
            <StatCard
              label="TOTAL_REVENUE"
              value={formatMoney(stats?.totalRevenue ?? 0, stats?.currency || 'INR')}
              hint="ALL SUCCESSFUL CHARGES"
              icon={<Wallet className="w-8 h-8" />}
              valueIsString
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <div className="flex flex-col gap-4 mb-6 border-b border-[#30363d] pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h2 className="text-sm font-bold text-slate-300 tracking-widest uppercase">
                    REVENUE_BY_DAY
                  </h2>
                  <div className="flex gap-2">
                    <RangeButton active={preset === 7} onClick={() => applyPreset(7)} label="7D" />
                    <RangeButton active={preset === 30} onClick={() => applyPreset(30)} label="30D" />
                    <RangeButton
                      active={preset === 'custom'}
                      onClick={() => setPreset('custom')}
                      label="CUSTOM"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-[10px] text-slate-500 tracking-widest uppercase">From</label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      setPreset('custom');
                    }}
                    className="bg-[#0d1117] border border-[#30363d] text-xs text-white px-3 py-2 rounded"
                  />
                  <label className="text-[10px] text-slate-500 tracking-widest uppercase">To</label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => {
                      setTo(e.target.value);
                      setPreset('custom');
                    }}
                    className="bg-[#0d1117] border border-[#30363d] text-xs text-white px-3 py-2 rounded"
                  />
                </div>
              </div>

              <div className="h-64 flex items-end justify-between gap-1 md:gap-2 pt-6 border-l border-b border-[#30363d] px-2 md:px-4 relative">
                {(stats?.revenueByDay ?? []).length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 tracking-widest">
                    NO_REVENUE_DATA
                  </div>
                ) : (
                  (stats?.revenueByDay ?? []).map((bucket) => {
                    const heightPct =
                      bucket.amount > 0
                        ? Math.max(8, Math.round((bucket.amount / maxRevenue) * 100))
                        : 3;
                    const isPeak = bucket.amount === maxRevenue && bucket.amount > 0;
                    const dayLabel = bucket.date.slice(8);
                    const showLabel =
                      chartDayCount <= 10 ||
                      Number(dayLabel) % (chartDayCount > 20 ? 5 : 2) === 1;
                    return (
                      <div
                        key={bucket.date}
                        className="h-full flex-1 min-w-0 flex flex-col justify-end items-center relative group"
                      >
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          <div className="bg-[#0d1117] border border-[#30363d] text-[9px] text-amber-400 font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
                            {formatMoney(bucket.amount, stats?.currency || 'INR')}
                            {bucket.count > 0 ? ` · ${bucket.count}` : ''}
                          </div>
                        </div>
                        <div
                          className={`w-full max-w-[28px] mx-auto rounded-t-sm transition-all duration-500 ${
                            bucket.amount > 0
                              ? isPeak
                                ? 'bg-amber-500'
                                : 'bg-amber-500/55 group-hover:bg-amber-500/80'
                              : 'bg-[#30363d]'
                          }`}
                          style={{ height: `${heightPct}%` }}
                          title={`${bucket.date}: ${formatMoney(bucket.amount, stats?.currency || 'INR')} (${bucket.count})`}
                        />
                        {showLabel && (
                          <div className="absolute -bottom-5 text-[9px] text-slate-500 font-mono">
                            {dayLabel}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="mt-8 text-[10px] text-slate-500 tracking-widest uppercase">
                {from} → {to} · SUCCESS PAYMENTS ONLY
                {stats?.revenueByDay
                  ? ` · PERIOD TOTAL ${formatMoney(
                      stats.revenueByDay.reduce((sum, d) => sum + d.amount, 0),
                      stats.currency || 'INR'
                    )}`
                  : ''}
              </div>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 flex flex-col">
              <h2 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-6 border-b border-[#30363d] pb-4">
                RECENT_PAYMENTS
              </h2>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                  <div>TIME</div>
                  <div className="col-span-2">EVENT</div>
                  <div className="text-right">STATUS</div>
                </div>

                {(stats?.recentPayments ?? []).length === 0 ? (
                  <div className="text-xs text-slate-500 py-8 text-center tracking-widest">
                    NO_PAYMENT_ACTIVITY
                  </div>
                ) : (
                  stats?.recentPayments.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-4 gap-2 text-[10px] font-mono items-center border-b border-[#30363d]/50 pb-3"
                    >
                      <div className="text-slate-500">
                        {new Date(item.createdAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false,
                        })}
                      </div>
                      <div className="col-span-2 text-slate-300 truncate">
                        {item.planName} · {formatMoney(item.amount, item.currency)}
                        <div className="text-slate-600 truncate">
                          {item.userName || item.userEmail || 'user'}
                        </div>
                      </div>
                      <div className={`text-right font-bold uppercase ${statusTone(item.status)}`}>
                        {item.status.slice(0, 3)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link
                to="/admin/sales"
                className="w-full mt-4 py-2 text-[10px] font-bold tracking-widest text-slate-400 hover:text-amber-500 border-t border-[#30363d] pt-4 transition-colors text-center"
              >
                VIEW_SALES_REPORT
              </Link>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

const StatCard = ({
  label,
  value,
  hint,
  icon,
  valueIsString,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: ReactNode;
  valueIsString?: boolean;
}) => (
  <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-lg relative overflow-hidden">
    <div className="absolute top-4 right-4 text-[#30363d]">{icon}</div>
    <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">{label}</div>
    <div className="text-4xl font-bold text-white tracking-wider mb-2">
      {valueIsString ? value : Number(value).toLocaleString()}
    </div>
    <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
      <Activity className="w-3 h-3" /> {hint}
    </div>
  </div>
);

const RangeButton = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1 text-[10px] font-bold rounded ${
      active ? 'bg-amber-500 text-black' : 'bg-[#30363d] text-white'
    }`}
  >
    {label}
  </button>
);
