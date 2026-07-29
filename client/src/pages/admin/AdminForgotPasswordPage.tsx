import { ShieldAlert, Mail, Terminal, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminService } from '../../api/admin/admin.service';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { OTP_RESEND_COOLDOWN_MS } from '../../utils/constants';
import { validateAdminForgotEmail } from '../../validation';

export const AdminForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateAdminForgotEmail(email);
    if (emailError) return toast.error(emailError);

    setIsLoading(true);
    try {
      await AdminService.forgotPassword(email);
      toast.success("Recovery code dispatched");
      localStorage.setItem('adminOtpEndTime', (Date.now() + OTP_RESEND_COOLDOWN_MS).toString());
      navigate('/admin/verify', { state: { email } });
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Failed to initiate recovery");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center font-mono relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBoNDBWMGgtMXYzOWgtMzl2MXoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz4KPC9zdmc+')] pointer-events-none"></div>

      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Terminal className="w-5 h-5 text-amber-500" />
        <span className="text-amber-500 font-bold tracking-widest text-sm">DEVCOLLAB // ADMIN</span>
      </div>

      <div className="absolute top-6 right-6">
        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-xs font-bold tracking-widest flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" />
          SYSTEM RECOVERY
        </div>
      </div>

      <div className="w-full max-w-[420px] bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl shadow-black/50 relative z-10 overflow-hidden">
        <div className="h-1 w-full bg-amber-500"></div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wider mb-1 uppercase">CREDENTIAL_RESET</h2>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase">Secure Recovery Protocol</p>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          {/* Warning Message
          <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3 mb-6">
            <p className="text-xs text-amber-500/90 leading-relaxed font-sans">
              Enter your registered admin identifier. A secure recovery code will be dispatched to your authorized communication channel.
            </p>
          </div> */} 

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                <span>Admin Identifier</span>
                <span className="text-slate-600">REQ_FIELD</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-[#010409] border border-[#30363d] rounded text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-sans" 
                  placeholder="admin@devcollab.com"
                  required
                />
              </div>
            </div>

            <button disabled={isLoading} type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded font-bold text-sm tracking-widest transition-colors mt-6 uppercase disabled:opacity-50">
              {isLoading ? "TRANSMITTING..." : "TRANSMIT CODE"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <a href="/admin/login" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 hover:text-amber-500 transition-colors uppercase">
              <ArrowLeft className="w-3 h-3" />
              ABORT RECOVERY
            </a>
          </div>
        </div>

        <div className="bg-[#010409] border-t border-[#30363d] p-3 px-8 flex items-center justify-center text-[10px] font-bold tracking-widest text-slate-600 uppercase">
          SECURE CONNECTION ESTABLISHED
        </div>
      </div>
    </div>
  );
};
