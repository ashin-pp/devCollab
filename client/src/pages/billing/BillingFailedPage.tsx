import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CreditCard, LayoutDashboard, RotateCcw, XCircle } from 'lucide-react';
import { UserLayout } from '../../layouts/UserLayout';

export const BillingFailedPage = () => {
  const [searchParams] = useSearchParams();
  const planName = searchParams.get('plan');
  const rawReason = searchParams.get('reason');
  const reason =
    (rawReason && rawReason.trim()) ||
    'We could not complete your payment. No charges were applied for this attempt.';
  const next = searchParams.get('next') || '/billing';
  const safeNext = next.startsWith('/') ? next : '/billing';

  return (
    <UserLayout>
      <div
        className="min-h-full relative overflow-hidden bg-gradient-to-b from-rose-50/80 via-white to-slate-50"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-orange-100/50 blur-3xl" />
          <div className="absolute top-1/3 left-0 h-40 w-40 rounded-full bg-slate-200/30 blur-3xl" />
        </div>

        <div className="relative max-w-lg mx-auto px-6 py-16 md:py-24 text-center animate-[fadeInUp_0.45s_ease-out_both]">
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-200">
            <XCircle className="h-10 w-10" strokeWidth={2.25} />
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-700 mb-3">
            Payment failed
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            {planName ? `Couldn\u2019t activate ${planName}` : 'Payment couldn\u2019t be completed'}
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto">
            {reason}
          </p>

          <div className="mb-10 rounded-2xl border border-rose-100 bg-white/80 px-5 py-4 text-left shadow-sm shadow-rose-50">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-700 mb-2">
              What you can do
            </p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li>Try again with the same or a different payment method.</li>
              <li>Confirm your card details and that the bank didn&apos;t block the charge.</li>
              <li>Your plan stays unchanged until a payment succeeds.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/billing"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-6 py-3 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try again
            </Link>
            <Link
              to={safeNext === '/billing' ? '/dashboard' : safeNext}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold px-6 py-3 transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Go to dashboard
            </Link>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <CreditCard className="w-3.5 h-3.5" />
              Use Razorpay test cards in development
            </p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};
