
import { Box, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f4f7fb] font-sans relative overflow-hidden p-4">
      {/* Subtle Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 relative z-10">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
          <Box className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">DevCollab</span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 relative z-10 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Forgot Password?</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Enter your professional email address and we'll send you a secure reset code.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Professional Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-200">
            Send Reset Link
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          &copy; 2024 DevCollab Infrastructure
        </p>
      </div>
    </div>
  );
};
