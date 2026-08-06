import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Check,
  CreditCard,
  Loader2,
  Rocket,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { UserLayout } from '../../layouts/UserLayout';
import { PlanService, type Plan } from '../../api/plan/plan.service';
import { UserService } from '../../api/user/user.service';
import type { ProfilePlanSnapshot } from '../../types/user.types';

const formatPrice = (plan: Pick<Plan, 'price' | 'currency'>) => {
  const symbol = plan.currency === 'INR' ? '₹' : plan.currency === 'USD' ? '$' : `${plan.currency} `;
  return `${symbol}${Number(plan.price).toFixed(plan.price % 1 === 0 ? 0 : 2)}`;
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

/** Unambiguous for all locales (avoids 9/4 vs 4/9 confusion). */
const formatPlanDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const buildFeatures = (plan: Plan, previousName?: string) => {
  const features: string[] = [];
  if (previousName) {
    features.push(`Includes ${previousName} plan`);
  }
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
  isExpired: boolean
) => {
  if (isCurrent && isExpired) return `Renew ${plan.name}`;
  if (isCurrent) return 'Current plan';
  if (currentIndex >= 0 && index > currentIndex) return `Upgrade to ${plan.name}`;
  if (currentIndex >= 0 && index < currentIndex) return `Switch to ${plan.name}`;
  return `Choose ${plan.name}`;
};

export const BillingPage = () => {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('next') || '/dashboard';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [effectivePlan, setEffectivePlan] = useState<ProfilePlanSnapshot | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
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

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [planList, profileRes] = await Promise.all([
          PlanService.getActivePlans(),
          UserService.getProfile(),
        ]);
        setPlans(planList);
        const profile = profileRes?.data;
        const planId = profile?.planId ?? profile?.currentPlan?.id ?? null;
        setCurrentPlanId(typeof planId === 'string' ? planId : null);
        setEffectivePlan(profile?.currentPlan ?? null);
        setPlanExpiresAt(profile?.planExpiresAt ?? null);
        setIsSubscriptionExpired(Boolean(profile?.isSubscriptionExpired));
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

  const applyProfilePlan = (data: {
    planId?: string | null;
    planExpiresAt?: string | null;
    isSubscriptionExpired?: boolean;
    currentPlan?: ProfilePlanSnapshot | null;
  }) => {
    const nextId = data.planId ?? data.currentPlan?.id ?? null;
    setCurrentPlanId(typeof nextId === 'string' ? nextId : null);
    setEffectivePlan(data.currentPlan ?? null);
    setPlanExpiresAt(data.planExpiresAt ?? null);
    setIsSubscriptionExpired(Boolean(data.isSubscriptionExpired));
  };

  const handleSelectPlan = async (plan: Plan) => {
    const isCurrent = plan.id === currentPlanId;
    if (isCurrent && !isSubscriptionExpired) return;

    setSavingPlanId(plan.id);
    try {
      const res = await UserService.selectPlan(plan.id);
      applyProfilePlan(res?.data ?? {});
      sessionStorage.setItem('preferredPlanId', plan.id);
      sessionStorage.setItem('preferredPlanName', plan.name);
      toast.success(
        isCurrent && isSubscriptionExpired
          ? `${plan.name} renewed.`
          : plan.price === 0
            ? `${plan.name} is now your plan.`
            : `${plan.name} selected. Checkout with Razorpay comes next.`
      );
    } catch (err: unknown) {
      let errMsg = 'Failed to update plan';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      }
      toast.error(errMsg);
    } finally {
      setSavingPlanId(null);
    }
  };

  return (
    <UserLayout>
      <div
        className="min-h-full bg-gradient-to-b from-slate-50 via-white to-white"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <Link
                to={returnTo.startsWith('/') ? returnTo : '/dashboard'}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 mb-3">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-bold tracking-wide text-blue-700 uppercase">
                  Plans & Billing
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Manage your plan
              </h1>
              <p className="text-slate-500 mt-2 max-w-xl text-sm md:text-base">
                Your subscription belongs to your account and applies across all workspaces you own.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24 gap-2 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              Loading plans...
            </div>
          ) : (
            <>
              {isSubscriptionExpired && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-rose-800">Your subscription has expired</p>
                    <p className="text-sm text-rose-700 mt-0.5">
                      Renew your current plan or upgrade below to unlock workspaces, invites, and AI
                      features again.
                    </p>
                  </div>
                </div>
              )}

              <section
                className={`rounded-2xl border p-5 sm:p-6 ${
                  isSubscriptionExpired
                    ? 'border-rose-200 bg-white'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Current plan
                    </p>
                    {displayPlan ? (
                      <>
                        <h2 className="text-2xl font-extrabold text-slate-900 capitalize">
                          {displayPlan.name}
                        </h2>
                        <p className="text-sm text-slate-500 mt-2">
                          {formatPrice(displayPlan)} / {formatCycle(displayPlan.durationDays)}
                          {' · '}
                          {displayPlan.maxWorkspaces >= 9999
                            ? 'Unlimited'
                            : displayPlan.maxWorkspaces}{' '}
                          workspaces ·{' '}
                          {displayPlan.maxMembersPerWorkspace >= 9999
                            ? 'Unlimited'
                            : displayPlan.maxMembersPerWorkspace}{' '}
                          members / workspace
                        </p>
                        {planExpiresAt && (
                          <p
                            className={`text-sm mt-2 font-semibold ${
                              isSubscriptionExpired ? 'text-rose-600' : 'text-slate-600'
                            }`}
                          >
                            {isSubscriptionExpired
                              ? `Expired on ${formatPlanDate(planExpiresAt)}`
                              : remainingDays !== null && remainingDays <= 7
                                ? `Renews ${formatPlanDate(planExpiresAt)} · ${remainingDays} day${remainingDays === 1 ? '' : 's'} left`
                                : `Renews on ${formatPlanDate(planExpiresAt)}`}
                          </p>
                        )}
                        {!catalogCurrent && effectivePlan && (
                          <p className="text-xs text-amber-700 mt-2 font-medium">
                            This plan is no longer offered for new subscribers. You keep it until
                            expiry — then you&apos;ll move to Starter unless you upgrade.
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-extrabold text-slate-900">No plan selected</h2>
                        <p className="text-sm text-slate-500 mt-1">
                          Choose a plan below to set workspace and member limits for your account.
                        </p>
                      </>
                    )}
                  </div>

                  <span
                    className={`inline-flex self-start items-center rounded-full px-3 py-1.5 text-xs font-bold border ${
                      isSubscriptionExpired
                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                        : displayPlan
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isSubscriptionExpired
                      ? 'Expired'
                      : displayPlan
                        ? 'Active'
                        : 'Not set'}
                  </span>
                </div>

                {isSubscriptionExpired && catalogCurrent && (
                  <button
                    type="button"
                    disabled={!!savingPlanId}
                    onClick={() => void handleSelectPlan(catalogCurrent)}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 transition-colors"
                  >
                    {savingPlanId === catalogCurrent.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Renewing…
                      </>
                    ) : (
                      `Renew ${catalogCurrent.name}`
                    )}
                  </button>
                )}
              </section>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                  {isSubscriptionExpired ? 'Renew or upgrade' : 'Available plans'}
                </h3>

                {plans.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center py-16 px-6">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No active plans yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Check back once an admin publishes subscription plans.
                    </p>
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
                      const canAct = !isCurrent || isSubscriptionExpired;
                      const label = planActionLabel(
                        plan,
                        index,
                        currentIndex,
                        isCurrent,
                        isSubscriptionExpired
                      );

                      return (
                        <div
                          key={plan.id}
                          className={`relative flex flex-col rounded-2xl border p-6 bg-white transition-shadow ${
                            isCurrent
                              ? isSubscriptionExpired
                                ? 'border-rose-400 shadow-md shadow-rose-50 ring-1 ring-rose-400'
                                : 'border-blue-600 shadow-lg shadow-blue-100/80 ring-1 ring-blue-600'
                              : isPopular
                                ? 'border-blue-300 shadow-md shadow-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {(isPopular || isCurrent) && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <span
                                className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                                  isCurrent
                                    ? isSubscriptionExpired
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-emerald-600 text-white'
                                    : 'bg-blue-600 text-white'
                                }`}
                              >
                                {isCurrent
                                  ? isSubscriptionExpired
                                    ? 'Expired'
                                    : 'Your plan'
                                  : 'Most popular'}
                              </span>
                            </div>
                          )}

                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${
                              isCurrent || isPopular
                                ? isCurrent && isSubscriptionExpired
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-blue-600 text-white'
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
                            <span className="text-sm font-medium text-slate-500">
                              {' '}
                              / {formatCycle(plan.durationDays)}
                            </span>
                          </div>

                          <ul className="space-y-2.5 mb-8 flex-1">
                            {features.map((feature) => (
                              <li
                                key={feature}
                                className="flex items-start gap-2.5 text-sm text-slate-600"
                              >
                                <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <button
                            type="button"
                            disabled={!canAct || !!savingPlanId}
                            onClick={() => void handleSelectPlan(plan)}
                            className={`w-full py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 ${
                              !canAct
                                ? 'bg-slate-100 text-slate-500 cursor-default'
                                : isCurrent && isSubscriptionExpired
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                  : isPopular || (currentIndex >= 0 && index > currentIndex)
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'border border-slate-300 hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            {isSaving ? (
                              <span className="inline-flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving…
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
              </div>

              <p className="text-xs text-slate-400 text-center pb-4">
                Paid checkout with Razorpay will plug in next — selecting a paid plan saves your
                preference for now.
              </p>
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
};
