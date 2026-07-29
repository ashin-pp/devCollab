import { useState, useRef, useEffect } from 'react';
import { Terminal, AlertTriangle, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminService } from '../../api/admin/admin.service';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { OTP_RESEND_COOLDOWN_MS } from '../../utils/constants';
import { isDigitOnly, validateAdminOtp } from '../../validation';

export const AdminVerifyOtpPage = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("Invalid session. Please start over.");
      navigate('/admin/forgot-password');
      return;
    }

    const updateTimer = () => {
      const endTime = parseInt(localStorage.getItem('adminOtpEndTime') || '0', 10);
      const now = Date.now();
      if (endTime > now) {
        setTimeLeft(Math.ceil((endTime - now) / 1000));
      } else {
        setTimeLeft(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value && !isDigitOnly(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    const otpError = validateAdminOtp(otp);
    if (otpError) return toast.error(otpError);

    setIsLoading(true);
    try {
      await AdminService.verifyResetOtp(email, otpString);
      toast.success("Identity verified successfully");
      localStorage.removeItem('adminOtpEndTime');
      navigate('/admin/reset-password', { state: { email, otp: otpString } });
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Invalid OTP code");
      } else {
        toast.error("Invalid code entered or an unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    try {
      await AdminService.forgotPassword(email);
      toast.success("A new code has been dispatched");
      localStorage.setItem('adminOtpEndTime', (Date.now() + OTP_RESEND_COOLDOWN_MS).toString());
      setTimeLeft(OTP_RESEND_COOLDOWN_MS / 1000);
    } catch (err: unknown) {
      toast.error("Failed to re-transmit code");
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
              <h2 className="text-xl font-bold text-white tracking-wider mb-1 uppercase">IDENTITY_VERIFY</h2>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase">Awaiting Authorization Code</p>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-center text-amber-500">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>

          <p className="text-sm text-slate-400 font-sans mb-8">
            Enter the 4-digit secure code transmitted to <strong className="text-slate-200">{email || 'your email'}</strong>.
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 md:w-12 md:h-14 bg-[#010409] border border-[#30363d] rounded text-center text-lg font-bold text-amber-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors shadow-inner font-sans"
                  placeholder="-"
                />
              ))}
            </div>

            <button disabled={isLoading} type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded font-bold text-sm tracking-widest transition-colors mt-6 uppercase disabled:opacity-50">
              {isLoading ? "VERIFYING..." : "VERIFY_CODE"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            NO CODE RECEIVED? 
            <button 
              type="button" 
              onClick={handleResend} 
              disabled={timeLeft > 0}
              className={`ml-1 transition-colors flex items-center justify-center gap-1 mx-auto mt-2 ${timeLeft > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-amber-500 hover:text-amber-400'}`}
            >
              <RefreshCw className={`w-3 h-3 ${timeLeft > 0 ? '' : 'animate-pulse'}`} /> 
              {timeLeft > 0 ? `RE-TRANSMIT IN (${timeLeft}S)` : 'RE-TRANSMIT'}
            </button>
          </div>
        </div>

        <div className="bg-[#010409] border-t border-[#30363d] p-3 px-8 flex items-center justify-center text-[10px] font-bold tracking-widest text-slate-600 uppercase">
          SECURE CONNECTION ESTABLISHED
        </div>
      </div>
    </div>
  );
};
