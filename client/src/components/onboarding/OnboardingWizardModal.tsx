import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Box,
  Building2,
  Check,
  Code2,
  Loader2,
  Palette,
  Rocket,
  Ruler,
  Settings2,
  Sparkles,
  User,
  Video,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../api/user/user.service';
import { PlanService, type Plan } from '../../api/plan/plan.service';
import { isFreePlan } from '../../utils/is-free-plan';
import { checkoutAndVerifyPlan } from '../../utils/plan-checkout';

const ROLES = [
  { id: 'Developer', title: 'Developer', description: 'Coding, debugging, shipping features.', icon: Code2, accent: 'from-sky-500 to-blue-600' },
  { id: 'Designer', title: 'Designer', description: 'Visuals, prototypes, and polish.', icon: Palette, accent: 'from-rose-400 to-pink-500' },
  { id: 'Product Manager', title: 'Product Manager', description: 'Roadmaps and stakeholder sync.', icon: Rocket, accent: 'from-amber-400 to-orange-500' },
  { id: 'Architect', title: 'Architect', description: 'Systems and infrastructure design.', icon: Ruler, accent: 'from-emerald-400 to-teal-600' },
  { id: 'Data Scientist', title: 'Data Scientist', description: 'Models, analysis, and insight.', icon: BarChart3, accent: 'from-violet-400 to-indigo-500' },
  { id: 'DevOps', title: 'DevOps', description: 'CI/CD, automation, and cloud.', icon: Settings2, accent: 'from-cyan-400 to-blue-500' },
  { id: 'Other', title: 'Other', description: 'Tell us what you do instead.', icon: Box, accent: 'from-slate-400 to-slate-600' },
] as const;

const ONBOARDING_KEY = 'needsOnboarding';
const ENTRANCE_KEY = 'onboardingEntrance';

export function markNeedsOnboarding() {
  sessionStorage.setItem(ONBOARDING_KEY, 'true');
}

export function clearNeedsOnboarding() {
  sessionStorage.removeItem(ONBOARDING_KEY);
}

export function shouldShowOnboarding() {
  return sessionStorage.getItem(ONBOARDING_KEY) === 'true';
}

/** Call right before navigating to dashboard after register/verify. */
export function markOnboardingEntrance() {
  sessionStorage.setItem(ENTRANCE_KEY, 'true');
}

export function peekOnboardingEntrance() {
  return sessionStorage.getItem(ENTRANCE_KEY) === 'true';
}

/** Prefer peek on mount, then consume once the overlay actually starts (avoids Strict Mode double-mount). */
export function consumeOnboardingEntrance() {
  const active = sessionStorage.getItem(ENTRANCE_KEY) === 'true';
  if (active) sessionStorage.removeItem(ENTRANCE_KEY);
  return active;
}

type Props = {
  isOpen: boolean;
  onComplete: () => void;
  initialStep?: 1 | 2;
};

const formatPrice = (plan: Plan) => {
  const symbol = plan.currency === 'INR' ? '₹' : plan.currency === 'USD' ? '$' : `${plan.currency} `;
  return `${symbol}${Number(plan.price).toFixed(plan.price % 1 === 0 ? 0 : 2)}`;
};

const durationLabel = (days: number) => {
  if (days === 30) return 'month';
  if (days === 365) return 'year';
  return `${days} days`;
};

const sharedOverlayStyles = `
  @keyframes stepSlideForward {
    from { opacity: 0; transform: translateX(32px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes stepSlideBack {
    from { opacity: 0; transform: translateX(-32px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes loaderFadeIn {
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes loaderSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes loaderOrbit {
    to { transform: rotate(-360deg); }
  }
  @keyframes loaderSoftPulse {
    0%, 100% { opacity: 0.35; transform: scale(0.92); }
    50% { opacity: 0.75; transform: scale(1.05); }
  }
  @keyframes loaderGlow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.85; }
  }
  @keyframes loaderShimmer {
    0% { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  @keyframes loaderDot {
    0%, 80%, 100% { opacity: 0.25; transform: translateY(0) scale(0.9); }
    40% { opacity: 1; transform: translateY(-3px) scale(1.1); }
  }
`;

/** Stylish minimal bridge after OTP / Google register → dashboard. */
export const OnboardingEntranceOverlay = ({
  visible,
  onDone,
  userName,
  title,
  subtitle = 'Getting your workspace ready…',
}: {
  visible: boolean;
  onDone?: () => void;
  userName?: string | null;
  title?: string;
  subtitle?: string;
}) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  const firstName = userName?.trim().split(/\s+/)[0] || '';
  const welcomeTitle = title ?? (firstName ? `Welcome, ${firstName}` : 'Welcome aboard');

  useEffect(() => {
    if (!visible) return;
    setPhase('enter');
    const holdAt = window.setTimeout(() => setPhase('hold'), 280);
    if (!onDone) return () => window.clearTimeout(holdAt);

    const fadeOutAt = window.setTimeout(() => setPhase('exit'), 1450);
    const doneAt = window.setTimeout(() => onDone(), 1800);
    return () => {
      window.clearTimeout(holdAt);
      window.clearTimeout(fadeOutAt);
      window.clearTimeout(doneAt);
    };
  }, [visible, onDone]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 380ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      aria-live="polite"
      aria-busy="true"
    >
      {/* Soft canvas */}
      <div className="absolute inset-0 bg-[#F8FAFC]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(59,130,246,0.10),transparent_70%)]" />
      <div
        className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-400/15 blur-3xl"
        style={{ animation: 'loaderGlow 2.4s ease-in-out infinite' }}
      />

      <div
        className="relative flex flex-col items-center text-center px-6"
        style={{
          animation: 'loaderFadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}
      >
        {/* Spinner cluster */}
        <div className="relative mb-9 h-[88px] w-[88px]">
          <span
            className="absolute inset-0 rounded-full bg-blue-500/10"
            style={{ animation: 'loaderSoftPulse 2s ease-in-out infinite' }}
          />

          <span
            className="absolute inset-1"
            style={{ animation: 'loaderOrbit 4.5s linear infinite' }}
          >
            <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
            <span className="absolute bottom-1 left-2 h-1 w-1 rounded-full bg-blue-300/80" />
          </span>

          <span className="absolute inset-[14px] rounded-full border border-white/80 bg-white shadow-[0_8px_30px_-8px_rgba(37,99,235,0.35),0_0_0_1px_rgba(226,232,240,0.8)]" />

          <svg
            className="absolute inset-[10px] h-[68px] w-[68px]"
            viewBox="0 0 68 68"
            fill="none"
            style={{ animation: 'loaderSpin 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
            aria-hidden
          >
            <circle cx="34" cy="34" r="26" stroke="#E2E8F0" strokeWidth="3.5" />
            <path
              d="M60 34a26 26 0 0 0-26-26"
              stroke="url(#loaderGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="loaderGrad" x1="34" y1="8" x2="60" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="1" stopColor="#2563EB" />
              </linearGradient>
            </defs>
          </svg>

          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 text-white shadow-md shadow-blue-500/30">
              <Box className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          </span>
        </div>

        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600/80">
          DevCollab
        </p>
        <h2
          className="text-[22px] sm:text-2xl font-extrabold tracking-tight text-slate-800"
          style={{
            backgroundImage: 'linear-gradient(90deg, #0f172a 0%, #2563eb 45%, #0f172a 90%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            animation: 'loaderShimmer 2.8s ease-in-out infinite',
          }}
        >
          {welcomeTitle}
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-400">{subtitle}</p>

        <div className="mt-6 flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-gradient-to-b from-sky-400 to-blue-600"
              style={{
                animation: 'loaderDot 1.15s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{sharedOverlayStyles}</style>
    </div>
  );
};

export const OnboardingWizardModal = ({ isOpen, onComplete, initialStep = 1 }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(initialStep);
  const [stepDir, setStepDir] = useState<'forward' | 'back'>('forward');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState('');
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  const isOther = selectedRoleId === 'Other';
  const resolvedTitle = isOther ? customRole.trim() : selectedRoleId;
  const canContinueRole = Boolean(resolvedTitle) && (!isOther || customRole.trim().length >= 2);

  const goToStep = (next: 1 | 2) => {
    setStepDir(next > step ? 'forward' : 'back');
    setStep(next);
  };

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setStepDir('forward');
      setSelectedRoleId(null);
      setCustomRole('');
      setSelectedPlanId(null);
      setEntered(false);
      const t = window.requestAnimationFrame(() => setEntered(true));
      return () => window.cancelAnimationFrame(t);
    }
    setEntered(false);
  }, [isOpen, initialStep]);

  useEffect(() => {
    if (isOther) {
      const t = window.setTimeout(() => customInputRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
  }, [isOther]);

  useEffect(() => {
    if (!isOpen || step !== 2) return;

    const load = async () => {
      setIsLoadingPlans(true);
      try {
        const data = await PlanService.getActivePlans();
        setPlans(data);
      } catch (err: unknown) {
        let errMsg = 'Failed to load plans';
        if (isAxiosError(err)) {
          errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
        }
        toast.error(errMsg);
      } finally {
        setIsLoadingPlans(false);
      }
    };
    load();
  }, [isOpen, step]);

  const popularIndex = useMemo(() => (plans.length >= 2 ? 1 : 0), [plans.length]);

  if (!isOpen) return null;

  const finishWithFreePlan = async (plan: Plan) => {
    try {
      await UserService.selectPlan(plan.id);
      sessionStorage.setItem('preferredPlanId', plan.id);
      sessionStorage.setItem('preferredPlanName', plan.name);
    } catch (err: unknown) {
      let errMsg = 'Failed to save plan';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      }
      toast.error(errMsg);
      throw err;
    }
    clearNeedsOnboarding();
    onComplete();
  };

  const closeWithoutPlanChange = () => {
    clearNeedsOnboarding();
    onComplete();
  };

  const handleSaveRole = async () => {
    if (!canContinueRole || !resolvedTitle) {
      toast.error(isOther ? 'Please enter your role' : 'Please select a role to continue');
      return;
    }
    setIsSavingRole(true);
    try {
      await UserService.updateProfile({ title: resolvedTitle });
      toast.success('Profile focus saved');
      goToStep(2);
    } catch (err: unknown) {
      let errMsg = 'Failed to save your role';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      }
      toast.error(errMsg);
    } finally {
      setIsSavingRole(false);
    }
  };

  const goPaymentFailed = (plan: Plan, reason: string) => {
    clearNeedsOnboarding();
    onComplete();
    const params = new URLSearchParams({
      plan: plan.name,
      reason,
      next: '/billing',
    });
    navigate(`/billing/failed?${params.toString()}`);
  };

  const handleChoosePlan = async (plan: Plan) => {
    setSelectedPlanId(plan.id);
    setIsFinishing(true);
    try {
      if (isFreePlan(plan)) {
        await finishWithFreePlan(plan);
        toast.success(`${plan.name} is active — your free month has started.`);
        return;
      }

      const result = await checkoutAndVerifyPlan(plan);
      if (result.status === 'failed') {
        goPaymentFailed(plan, result.message);
        return;
      }

      sessionStorage.setItem('preferredPlanId', plan.id);
      sessionStorage.setItem('preferredPlanName', plan.name);
      clearNeedsOnboarding();
      onComplete();
      const params = new URLSearchParams({
        plan: plan.name,
        next: '/dashboard',
      });
      navigate(`/billing/success?${params.toString()}`);
    } catch (err: unknown) {
      let errMsg = 'Failed to activate plan';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      } else if (err instanceof Error && err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleSkipPlan = () => {
    toast('Keeping your free Starter plan — you can upgrade anytime from Billing.');
    closeWithoutPlanChange();
  };

  const stepAnim =
    stepDir === 'forward'
      ? 'animate-[stepSlideForward_0.38s_cubic-bezier(0.22,1,0.36,1)_both]'
      : 'animate-[stepSlideBack_0.38s_cubic-bezier(0.22,1,0.36,1)_both]';

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <style>{sharedOverlayStyles}</style>
      <div
        className={`relative bg-white rounded-[28px] shadow-[0_32px_80px_-20px_rgba(15,23,42,0.35)] w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-200/80 transition-all duration-500 ease-out ${
          entered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-[0.97]'
        }`}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-slate-50 to-transparent" />

        <div className="relative px-6 sm:px-8 pt-6 pb-4 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold tracking-wide text-blue-700 uppercase">
                Welcome setup
              </span>
            </div>
            <h2
              key={`title-${step}`}
              className={`text-2xl sm:text-[1.7rem] font-extrabold tracking-tight text-slate-900 ${stepAnim}`}
            >
              {step === 1 ? "What's your focus?" : 'Pick a plan that fits'}
            </h2>
            <p
              key={`sub-${step}`}
              className={`text-sm text-slate-500 mt-1.5 max-w-xl leading-relaxed ${stepAnim}`}
            >
              {step === 1
                ? 'Choose the role that best matches your day-to-day work. We use this as your profile title.'
                : 'Free plans activate immediately. Paid plans open Razorpay checkout now.'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeWithoutPlanChange}
            className="shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative px-6 sm:px-8 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            {[
              { n: 1 as const, label: 'Role' },
              { n: 2 as const, label: 'Plan' },
            ].map((s, i) => {
              const active = step === s.n;
              const done = step > s.n;
              return (
                <div key={s.n} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        done
                          ? 'bg-blue-600 text-white'
                          : active
                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {done ? <Check className="w-4 h-4" /> : s.n}
                    </div>
                    <span
                      className={`text-xs font-bold truncate transition-colors duration-300 ${
                        active || done ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i === 0 && (
                    <div className="flex-1 h-1 bg-slate-100 overflow-hidden rounded-full">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: step === 1 ? '0%' : '100%' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto overflow-x-hidden px-6 sm:px-8 pb-4">
          {step === 1 && (
            <div key="step-role" className={stepAnim}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRoleId === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`group relative isolate text-left rounded-2xl border p-4 transition-colors duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-white shadow-md ring-2 ring-blue-500/15 z-[1]'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${role.accent} text-white shadow-sm`}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1">{role.title}</h3>
                      <p className="text-xs text-slate-500 leading-snug">{role.description}</p>
                    </button>
                  );
                })}
              </div>

              {isOther && (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5 animate-[stepSlideForward_0.3s_ease-out_both]">
                  <label htmlFor="custom-role" className="block text-sm font-bold text-slate-800 mb-2">
                    What should we call your role?
                  </label>
                  <input
                    ref={customInputRef}
                    id="custom-role"
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canContinueRole) {
                        e.preventDefault();
                        void handleSaveRole();
                      }
                    }}
                    maxLength={60}
                    placeholder="e.g. Security Engineer, Founder, Researcher…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-shadow"
                  />
                  <p className="mt-2 text-[11px] text-slate-400">
                    Saved as your profile title · {customRole.trim().length}/60
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div key="step-plan" className={stepAnim}>
              {isLoadingPlans ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                  <p className="text-sm font-medium">Loading plans…</p>
                </div>
              ) : plans.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center py-16 px-6">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">No active plans yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You can skip for now and choose a plan later when your admin publishes one.
                  </p>
                </div>
              ) : (
                <div
                  className={`grid gap-4 sm:gap-5 items-stretch ${
                    plans.length === 1
                      ? 'grid-cols-1 max-w-md mx-auto'
                      : plans.length === 2
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  }`}
                >
                  {plans.map((plan, index) => {
                    const isPopular = index === popularIndex;
                    const Icon = index === 0 ? User : index === plans.length - 1 ? Building2 : Rocket;
                    const isPicking = isFinishing && selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        className={`relative flex flex-col min-w-0 h-full rounded-2xl border p-5 bg-white ${
                          isPopular
                            ? 'border-blue-500 shadow-lg shadow-blue-100/70'
                            : 'border-slate-200'
                        }`}
                        style={{
                          animation: `stepSlideForward 0.4s cubic-bezier(0.22,1,0.36,1) both`,
                          animationDelay: `${index * 60}ms`,
                        }}
                      >
                        <div className="mb-3 flex items-start justify-between gap-2 min-h-[28px]">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isPopular
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="w-[18px] h-[18px]" />
                          </div>
                          {isPopular && (
                            <span className="shrink-0 bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                              Most popular
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg capitalize break-words">
                          {plan.name}
                        </h3>
                        <p className="mt-2 mb-4">
                          <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                            {formatPrice(plan)}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 ml-1">
                            / {durationLabel(plan.durationDays)}
                          </span>
                        </p>
                        <ul className="space-y-2.5 mb-6 flex-1 text-sm text-slate-600">
                          <li className="flex gap-2.5 items-start">
                            <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                            {plan.maxWorkspaces} workspace{plan.maxWorkspaces === 1 ? '' : 's'}
                          </li>
                          <li className="flex gap-2.5 items-start">
                            <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                            {plan.maxMembersPerWorkspace} members / workspace
                          </li>
                          <li className="flex gap-2.5 items-start">
                            <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                            {plan.messageRetentionDays}-day message retention
                          </li>
                          {plan.aiAssistantEnabled && (
                            <li className="flex gap-2.5 items-start">
                              <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                              AI Assistant
                            </li>
                          )}
                          {plan.videoCallsEnabled && (
                            <li className="flex gap-2.5 items-start">
                              <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Video className="w-2.5 h-2.5" />
                              </span>
                              Video calls
                            </li>
                          )}
                        </ul>
                        <button
                          type="button"
                          disabled={isFinishing}
                          onClick={() => handleChoosePlan(plan)}
                          className={`mt-auto w-full py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 ${
                            isPopular
                              ? 'bg-slate-900 hover:bg-slate-800 text-white'
                              : 'border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          {isPicking ? (
                            <span className="inline-flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {isFreePlan(plan) ? 'Selecting…' : 'Opening checkout…'}
                            </span>
                          ) : isFreePlan(plan) ? (
                            `Continue with ${plan.name}`
                          ) : (
                            `Pay for ${plan.name}`
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative px-6 sm:px-8 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-50/80">
          {step === 1 ? (
            <>
              <p className="text-xs text-slate-400 font-medium">You can edit this later in your profile.</p>
              <button
                type="button"
                onClick={handleSaveRole}
                disabled={isSavingRole || !canContinueRole}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-blue-600/20 transition-all"
              >
                {isSavingRole ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => (initialStep === 2 ? closeWithoutPlanChange() : goToStep(1))}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {initialStep === 2 ? 'Cancel' : 'Back'}
              </button>
              <button
                type="button"
                onClick={() => void handleSkipPlan()}
                disabled={isFinishing}
                className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50"
              >
                Skip for now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
