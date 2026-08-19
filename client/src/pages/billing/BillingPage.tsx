import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  History,
  Loader2,
  Receipt,
  Rocket,
  Sparkles,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { UserLayout } from '../../layouts/UserLayout';
import { PlanService, type Plan } from '../../api/plan/plan.service';
import { PaymentService } from '../../api/payment/payment.service';
import { UserService } from '../../api/user/user.service';
import type { ProfilePlanSnapshot } from '../../types/user.types';
import type { PaymentTransaction, PaymentTransactionStatus } from '../../types/payment.types';
import { isFreePlan } from '../../utils/is-free-plan';
import { checkoutAndVerifyPlan } from '../../utils/plan-checkout';

const HISTORY_PAGE_SIZE = 10;

const formatPrice = (plan: Pick<Plan, 'price' | 'currency'>) => {
  const symbol = plan.currency === 'INR' ? '₹' : plan.currency === 'USD' ? '$' : `${plan.currency} `;
  const amount = Number(plan.price);
  if (!Number.isFinite(amount) || amount <= 0) return 'Free';
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

const formatMoney = (amount: number, currency: string) => {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : `${currency} `;
  return `${symbol}${Number(amount).toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

const formatCycle = (days: number) => {
  if (days === 30) return 'month';
  if (days === 365) return 'year';
  return `${days} days`;
};

const daysUntil = (iso: string | null) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const formatPlanDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const buildFeatures = (plan: Plan, previousName?: string) => {
  const features: string[] = [];
  if (previousName) features.push(`Includes ${previousName} plan`);
  features.push(
    `${plan.maxWorkspaces >= 9999 ? 'Unlimited' : `Up to ${plan.maxWorkspaces}`} workspaces`
  );
  features.push(
    `${plan.maxMembersPerWorkspace >= 9999 ? 'Unlimited' : `Up to ${plan.maxMembersPerWorkspace}`} members per workspace`
  );
  features.push(`${plan.messageRetentionDays}-day message retention`);
  if (plan.aiAssistantEnabled) features.push('Built-in AI Assistant');
  if (plan.videoCallsEnabled) features.push('Video calls enabled');
  if (plan.multiAiAgents) features.push('Multi AI agents');
  if (plan.pinBoardEnabled) features.push('Pin board');
  return features;
};

const planActionLabel = (
  plan: Plan,
  index: number,
  currentIndex: number,
  isCurrent: boolean,
  isExpired: boolean,
  isEntitled: boolean
) => {
  if (isCurrent && isExpired && isFreePlan(plan)) return 'Upgrade required';
  if (isCurrent && isExpired) return `Renew ${plan.name}`;
  if (isCurrent) return 'Current plan';
  if (isEntitled) return `Switch to ${plan.name}`;
  if (isFreePlan(plan)) return `Use ${plan.name}`;
  if (currentIndex >= 0 && index > currentIndex) return `Upgrade to ${plan.name}`;
  if (currentIndex >= 0 && index < currentIndex) return `Switch to ${plan.name}`;
  return `Choose ${plan.name}`;
};

const statusBadgeClass = (status: PaymentTransactionStatus) => {
  if (status === 'success') return 'bg-emerald-50 text-emerald-700';
  if (status === 'cancelled') return 'bg-amber-50 text-amber-800';
  return 'bg-rose-50 text-rose-700';
};

export const BillingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('next') || '/dashboard';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [effectivePlan, setEffectivePlan] = useState<ProfilePlanSnapshot | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const [entitledPlanIds, setEntitledPlanIds] = useState<Set<string>>(new Set());
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<PaymentTransactionStatus | ''>('');
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

  const popularIndex = useMemo(() => (plans.length >= 2 ? 1 : 0), [plans.length]);
  const currentIndex = useMemo(
    () => plans.findIndex((p) => p.id === currentPlanId),
    [plans, currentPlanId]
  );
  const catalogCurrent = useMemo(
    () => plans.find((p) => p.id === currentPlanId) ?? null,
    [plans, currentPlanId]
  );
  const displayPlan = catalogCurrent ?? effectivePlan;
  const remainingDays = daysUntil(planExpiresAt);

  const applyProfilePlan = (data: {
    planId?: string | null;
    planExpiresAt?: string | null;
    isSubscriptionExpired?: boolean;
    currentPlan?: ProfilePlanSnapshot | null;
    paidPlanEntitlements?: Array<{ planId: string; expiresAt: string }>;
  }) => {
    const nextId = data.planId ?? data.currentPlan?.id ?? null;
    setCurrentPlanId(typeof nextId === 'string' ? nextId : null);
    setEffectivePlan(data.currentPlan ?? null);
    setPlanExpiresAt(data.planExpiresAt ?? null);
    setIsSubscriptionExpired(Boolean(data.isSubscriptionExpired));
    if (data.paidPlanEntitlements) {
      const now = Date.now();
      setEntitledPlanIds(
        new Set(
          data.paidPlanEntitlements
            .filter((item) => new Date(item.expiresAt).getTime() > now)
            .map((item) => item.planId)
        )
      );
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [planList, profileRes] = await Promise.all([
          PlanService.getActivePlans(),
          UserService.getProfile(),
        ]);
        setPlans(planList);
        applyProfilePlan(profileRes?.data ?? {});
      } catch (err: unknown) {
        let errMsg = 'Failed to load billing details';
        if (isAxiosError(err)) {
          errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
        }
        toast.error(errMsg);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const refreshHistory = async (
    overrides?: Partial<{
      page: number;
      status: PaymentTransactionStatus | '';
    }>
  ) => {
    const page = overrides?.page ?? historyPage;
    const status = overrides?.status ?? statusFilter;
    setIsHistoryLoading(true);
    try {
      const history = await PaymentService.getHistory({
        page,
        limit: HISTORY_PAGE_SIZE,
        status: status || undefined,
      });
      setTransactions(history.items);
      setHistoryPage(history.page);
      setHistoryTotalPages(history.totalPages);
      setHistoryTotal(history.total);
    } catch {
      /* keep existing list */
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    void refreshHistory({ page: historyPage });
    // intentionally depend on filters + page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyPage, statusFilter]);

  const apiErrorMessage = (err: unknown, fallback: string) => {
    if (isAxiosError(err)) {
      return err.response?.data?.error?.message || err.response?.data?.message || fallback;
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

  const isPaymentRequiredError = (err: unknown) =>
    isAxiosError(err) && err.response?.status === 402;

  const goSuccess = (plan: Plan) => {
    const params = new URLSearchParams({
      plan: plan.name,
      next: returnTo.startsWith('/') ? returnTo : '/dashboard',
    });
    navigate(`/billing/success?${params.toString()}`);
  };

  const goFailed = (plan: Plan, reason: string) => {
    const params = new URLSearchParams({
      plan: plan.name,
      reason,
      next: '/billing',
    });
    navigate(`/billing/failed?${params.toString()}`);
  };

  const activatePlanWithoutCheckout = async (plan: Plan, isCurrent: boolean) => {
    const res = await UserService.selectPlan(plan.id);
    applyProfilePlan(res?.data ?? {});
    sessionStorage.setItem('preferredPlanId', plan.id);
    sessionStorage.setItem('preferredPlanName', plan.name);
    toast.success(
      isCurrent && isSubscriptionExpired
        ? `${plan.name} renewed.`
        : `${plan.name} is now your plan.`
    );
  };

  const checkoutPaidPlan = async (plan: Plan) => {
    const result = await checkoutAndVerifyPlan(plan);
    if (result.status === 'failed') {
      goFailed(plan, result.message);
      return;
    }
    applyProfilePlan((result.verifyPayload as Record<string, unknown>) ?? {});
    await refreshHistory({ page: 1 });
    goSuccess(plan);
  };

  const handleSelectPlan = async (plan: Plan) => {
    const isCurrent = plan.id === currentPlanId;
    if (isCurrent && !isSubscriptionExpired) return;

    // Expired free Starter → must upgrade, never pay for Starter.
    if (isCurrent && isSubscriptionExpired && isFreePlan(plan)) {
      toast.error('Your free Starter month has ended. Upgrade to a paid plan to continue.');
      return;
    }

    setSavingPlanId(plan.id);
    try {
      if (isFreePlan(plan)) {
        await activatePlanWithoutCheckout(plan, isCurrent);
        return;
      }

      if (entitledPlanIds.has(plan.id) && !(isCurrent && isSubscriptionExpired)) {
        await activatePlanWithoutCheckout(plan, isCurrent);
        return;
      }

      try {
        await activatePlanWithoutCheckout(plan, isCurrent);
      } catch (err: unknown) {
        if (!isPaymentRequiredError(err)) throw err;
        await checkoutPaidPlan(plan);
      }
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, 'Failed to update plan'));
    } finally {
      setSavingPlanId(null);
    }
  };

  return (
    <UserLayout>
      <div
        className="min-h-full relative overflow-hidden"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.12),_transparent_55%),linear-gradient(to_bottom,#f8fafc,#ffffff_40%,#f1f5f9)]" />
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <Link
                to={returnTo.startsWith('/') ? returnTo : '/dashboard'}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-slate-200/80 px-3 py-1 mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-[11px] font-bold tracking-wide text-slate-600 uppercase">
                  Billing
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                Plans that grow with you
              </h1>
              <p className="text-slate-500 mt-3 max-w-xl text-sm md:text-base leading-relaxed">
                Starter is free for your first month. After that, upgrade to keep creating
                workspaces and unlock paid features.
              </p>
            </div>

            {displayPlan && (
              <div className="rounded-3xl border border-white/80 bg-white/80 backdrop-blur-sm shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)] px-5 py-4 min-w-[240px]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Active plan
                </p>
                <p className="text-xl font-extrabold text-slate-900 capitalize mt-1">
                  {displayPlan.name}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {formatPrice(displayPlan)} / {formatCycle(displayPlan.durationDays)}
                </p>
                {planExpiresAt && (
                  <p
                    className={`text-xs font-semibold mt-2 ${
                      isSubscriptionExpired ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {isSubscriptionExpired
                      ? `Ended ${formatPlanDate(planExpiresAt)}`
                      : remainingDays !== null && remainingDays <= 7
                        ? `${remainingDays} day${remainingDays === 1 ? '' : 's'} left`
                        : `Until ${formatPlanDate(planExpiresAt)}`}
                  </p>
                )}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24 gap-2 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
              Loading billing…
            </div>
          ) : (
            <>
              {isSubscriptionExpired && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/90 px-5 py-4 flex gap-3 items-start shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-rose-800">
                      {displayPlan && isFreePlan(displayPlan)
                        ? 'Free Starter month ended'
                        : 'Subscription expired'}
                    </p>
                    <p className="text-sm text-rose-700 mt-0.5">
                      Upgrade to a paid plan to create workspaces and use premium features again.
                    </p>
                  </div>
                </div>
              )}

              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Choose a plan
                  </h2>
                </div>

                {plans.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 text-center py-16 px-6">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No active plans yet</p>
                  </div>
                ) : (
                  <div
                    className={`grid gap-5 items-stretch ${
                      plans.length === 1
                        ? 'grid-cols-1 max-w-md'
                        : plans.length === 2
                          ? 'grid-cols-1 md:grid-cols-2'
                          : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    }`}
                  >
                    {plans.map((plan, index) => {
                      const isPopular = index === popularIndex;
                      const isCurrent = plan.id === currentPlanId;
                      const previousName = index > 0 ? plans[index - 1]?.name : undefined;
                      const features = buildFeatures(plan, previousName);
                      const Icon =
                        index === 0 ? User : index === plans.length - 1 ? Building2 : Rocket;
                      const isSaving = savingPlanId === plan.id;
                      const free = isFreePlan(plan);
                      const canAct =
                        (!isCurrent || isSubscriptionExpired) &&
                        !(isCurrent && isSubscriptionExpired && free);
                      const isEntitled = entitledPlanIds.has(plan.id);
                      const label = planActionLabel(
                        plan,
                        index,
                        currentIndex,
                        isCurrent,
                        isSubscriptionExpired,
                        isEntitled
                      );

                      return (
                        <div
                          key={plan.id}
                          className={`relative flex flex-col rounded-3xl border p-6 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${
                            isCurrent
                              ? isSubscriptionExpired
                                ? 'border-rose-300 shadow-lg shadow-rose-100/70 ring-1 ring-rose-300'
                                : 'border-slate-900 shadow-xl shadow-slate-200/80 ring-1 ring-slate-900'
                              : isPopular
                                ? 'border-sky-200 shadow-lg shadow-sky-100/60'
                                : 'border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          {(isPopular || isCurrent || free) && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <span
                                className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                                  isCurrent
                                    ? isSubscriptionExpired
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-slate-900 text-white'
                                    : free
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-sky-600 text-white'
                                }`}
                              >
                                {isCurrent
                                  ? isSubscriptionExpired
                                    ? 'Expired'
                                    : 'Your plan'
                                  : free
                                    ? 'Free trial'
                                    : 'Popular'}
                              </span>
                            </div>
                          )}

                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${
                              isCurrent || isPopular
                                ? isCurrent && isSubscriptionExpired
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 capitalize">{plan.name}</h3>
                          <div className="mt-3 mb-5">
                            <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                              {formatPrice(plan)}
                            </span>
                            {!free && (
                              <span className="text-sm font-medium text-slate-500">
                                {' '}
                                / {formatCycle(plan.durationDays)}
                              </span>
                            )}
                            {free && (
                              <span className="text-sm font-medium text-slate-500">
                                {' '}
                                · {plan.durationDays}-day trial
                              </span>
                            )}
                          </div>

                          <ul className="space-y-2.5 mb-8 flex-1">
                            {features.map((feature) => (
                              <li
                                key={feature}
                                className="flex items-start gap-2.5 text-sm text-slate-600"
                              >
                                <Check className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <button
                            type="button"
                            disabled={!canAct || !!savingPlanId}
                            onClick={() => void handleSelectPlan(plan)}
                            className={`w-full py-3 rounded-2xl text-sm font-bold transition-colors disabled:opacity-60 ${
                              !canAct
                                ? 'bg-slate-100 text-slate-500 cursor-default'
                                : isCurrent && isSubscriptionExpired
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                  : isPopular || (currentIndex >= 0 && index > currentIndex)
                                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                                    : 'border border-slate-300 hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            {isSaving ? (
                              <span className="inline-flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {!free && !entitledPlanIds.has(plan.id)
                                  ? 'Opening checkout…'
                                  : 'Updating…'}
                              </span>
                            ) : (
                              label
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-slate-900">Transaction history</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Success, failed, and cancelled checkout attempts
                          {historyTotal > 0 ? ` · ${historyTotal} total` : ''}
                        </p>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-slate-300 hidden sm:block" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <label className="w-full sm:max-w-xs">
                      <span className="sr-only">Filter by status</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setHistoryPage(1);
                          setStatusFilter(e.target.value as PaymentTransactionStatus | '');
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      >
                        <option value="">All statuses</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </label>
                  </div>
                </div>

                {isHistoryLoading ? (
                  <div className="px-6 py-14 flex items-center justify-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading transactions…
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No transactions found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {statusFilter
                        ? 'Try clearing the status filter to see more history.'
                        : 'Paid checkouts and cancelled attempts will show up here.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                            <th className="px-5 sm:px-6 py-3 font-bold">Date</th>
                            <th className="px-5 sm:px-6 py-3 font-bold">Plan</th>
                            <th className="px-5 sm:px-6 py-3 font-bold">Amount</th>
                            <th className="px-5 sm:px-6 py-3 font-bold">Status</th>
                            <th className="px-5 sm:px-6 py-3 font-bold hidden md:table-cell">
                              Payment ID
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((txn) => (
                            <tr
                              key={txn.id}
                              className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors"
                            >
                              <td className="px-5 sm:px-6 py-3.5 text-slate-600 whitespace-nowrap">
                                {formatDateTime(txn.createdAt)}
                              </td>
                              <td className="px-5 sm:px-6 py-3.5 font-semibold text-slate-900 capitalize">
                                {txn.planName}
                              </td>
                              <td className="px-5 sm:px-6 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                                {formatMoney(txn.amount, txn.currency)}
                              </td>
                              <td className="px-5 sm:px-6 py-3.5">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusBadgeClass(txn.status)}`}
                                >
                                  {txn.status}
                                </span>
                              </td>
                              <td className="px-5 sm:px-6 py-3.5 text-slate-400 font-mono text-xs hidden md:table-cell truncate max-w-[180px]">
                                {txn.razorpayPaymentId || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-slate-500">
                        Page {historyPage} of {historyTotalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={historyPage <= 1 || isHistoryLoading}
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          Prev
                        </button>
                        <button
                          type="button"
                          disabled={historyPage >= historyTotalPages || isHistoryLoading}
                          onClick={() => setHistoryPage((p) => p + 1)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                        >
                          Next
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
};
