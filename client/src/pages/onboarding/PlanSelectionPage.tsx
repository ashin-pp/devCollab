import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Check,
  Loader2,
  Rocket,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { PlanService, type Plan } from '../../api/plan/plan.service';
import { pathAfterAuth } from '../../utils/pendingInvite';

const formatPrice = (plan: Plan) => {
  const symbol = plan.currency === 'INR' ? '₹' : plan.currency === 'USD' ? '$' : `${plan.currency} `;
  return `${symbol}${Number(plan.price).toFixed(plan.price % 1 === 0 ? 0 : 2)}`;
};

const formatCycle = (days: number) => {
  if (days === 30) return 'month';
  if (days === 365) return 'year';
  return `${days} days`;
};

const buildFeatures = (plan: Plan, isPopular: boolean, previousName?: string) => {
  const features: string[] = [];
  if (previousName) {
    features.push(`INCLUDES ${previousName.toUpperCase()} PLAN`);
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
  if (isPopular && !previousName) {
    // keep first popular card focused
  }
  return features;
};

export const PlanSelectionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromCreateWorkspace = searchParams.get('from') === 'create-workspace';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await PlanService.getActivePlans();
        setPlans(data);
        if (data.length > 1) setSelectedId(data[1].id);
        else if (data[0]) setSelectedId(data[0].id);
      } catch (err: unknown) {
        let errMsg = 'Failed to load plans';
        if (isAxiosError(err)) {
          errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
        }
        toast.error(errMsg);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const popularIndex = useMemo(() => {
    if (plans.length >= 2) return 1;
    return 0;
  }, [plans.length]);

  const finish = (chosenPlan?: Plan | null) => {
    if (chosenPlan) {
      sessionStorage.setItem('preferredPlanId', chosenPlan.id);
      sessionStorage.setItem('preferredPlanName', chosenPlan.name);
    }

    if (fromCreateWorkspace) {
      navigate('/dashboard?createWorkspace=1');
      return;
    }
    navigate(pathAfterAuth());
  };

  const handleChoose = async (plan: Plan) => {
    setSelectedId(plan.id);
    setIsContinuing(true);
    try {
      toast.success(`${plan.name} selected. Checkout with Razorpay comes next.`);
      finish(plan);
    } finally {
      setIsContinuing(false);
    }
  };

  const handleSkip = () => {
    sessionStorage.removeItem('preferredPlanId');
    toast('You can choose a plan anytime when creating a workspace.');
    finish(null);
  };

  return (
    <div className="min-h-screen bg-white font-[Plus_Jakarta_Sans,sans-serif] flex flex-col">
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">DevCollab</span>
        </Link>

        {!fromCreateWorkspace ? (
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-slate-400">1 Account</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">2 Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600">3 Choose Plan</span>
          </nav>
        ) : (
          <p className="text-sm font-semibold text-blue-600">Choose a plan to create workspaces</p>
        )}
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 md:py-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-4">
            Simple, transparent pricing
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Scale your team with the right plan
          </h1>
          <p className="text-slate-500 text-base md:text-lg">
            {fromCreateWorkspace
              ? 'Pick a plan that fits your team. You can skip for now and choose later.'
              : 'Select a plan to finalize your workspace setup — or skip and explore first.'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            Loading plans...
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-6">No active plans yet. You can continue and pick one later.</p>
            <button
              type="button"
              onClick={handleSkip}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, index) => {
              const isPopular = index === popularIndex;
              const previousName = index > 0 ? plans[index - 1]?.name : undefined;
              const features = buildFeatures(plan, isPopular, previousName);
              const Icon = index === 0 ? User : index === plans.length - 1 ? Building2 : Rocket;
              const isSelected = selectedId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl border bg-white p-7 flex flex-col transition-all ${
                    isPopular || isSelected
                      ? 'border-blue-600 shadow-xl shadow-blue-100 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mb-5 min-h-[40px]">
                    {plan.price === 0
                      ? 'Best for exploration.'
                      : isPopular
                        ? 'The engine for scaling teams.'
                        : 'Critical infrastructure for growing orgs.'}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900">{formatPrice(plan)}</span>
                    <span className="text-slate-500 text-sm font-medium"> / {formatCycle(plan.durationDays)}</span>
                    {plan.price === 0 && (
                      <p className="text-xs text-blue-600 font-semibold mt-1">Get started free</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span className={feature.startsWith('INCLUDES') ? 'font-bold text-slate-800' : ''}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    disabled={isContinuing}
                    onClick={() => handleChoose(plan)}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {isPopular ? 'Complete Setup' : `Choose ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors underline-offset-4 hover:underline"
          >
            Skip for now
          </button>
          <p className="text-xs text-slate-400 text-center">
            Used by engineering teams building products together.
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2024 DevCollab Infrastructure Inc.</p>
          <div className="flex items-center gap-4">
            <span>Support</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
