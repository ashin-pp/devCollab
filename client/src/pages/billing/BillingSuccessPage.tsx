import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CreditCard, LayoutDashboard } from 'lucide-react';
import { UserLayout } from '../../layouts/UserLayout';

export const BillingSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const planName = searchParams.get('plan') || 'your plan';
  const next = searchParams.get('next') || '/dashboard';
  const safeNext = next.startsWith('/') ? next : '/dashboard';

  return (
    <UserLayout>
      <div
        className="min-h-full relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-slate-50"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
        </div>

        <div className="relative max-w-lg mx-auto px-6 py-16 md:py-24 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200 animate-[bounce_1.2s_ease-in-out_1]">
            <CheckCircle2 className="h-10 w-10" strokeWidth={2.25} />
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">
            Payment successful
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            You&apos;re on {planName}
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-10 max-w-md mx-auto">
            Your subscription is active. You can switch back to this plan anytime during the paid
            cycle without paying again.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={safeNext}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-3 transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/billing"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold px-6 py-3 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Go to billing
            </Link>
          </div>

          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Go to dashboard
          </Link>
        </div>
      </div>
    </UserLayout>
  );
};
