import { useState, useRef, useEffect } from 'react';
import { Box, Mail, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../../api/auth/auth.service';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { isDigitOnly, validateOtp } from '../../validation';

export const VerifyOtpForgotPage = () => {
  const getInitialTimer = () => {
    const savedTime = localStorage.getItem('forgotOtpResendTimer');
    const savedTimestamp = localStorage.getItem('forgotOtpResendTimestamp');
    if (savedTime && savedTimestamp) {
      const timePassed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
      const timeLeft = parseInt(savedTime) - timePassed;
      return timeLeft > 0 ? timeLeft : 0;
    }
    return 60;
  };

  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(getInitialTimer());

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email, navigate]);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (resendTimer > 0) {
      localStorage.setItem('forgotOtpResendTimer', resendTimer.toString());
      localStorage.setItem('forgotOtpResendTimestamp', Date.now().toString());

      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      localStorage.removeItem('forgotOtpResendTimer');
      localStorage.removeItem('forgotOtpResendTimestamp');
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

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

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setResendTimer(60);
    try {
      await AuthService.forgotPassword(email);
      toast.success('OTP resent successfully!');
    } catch (err: unknown) {
      setResendTimer(0);
      let errMsg = 'Failed to resend OTP.';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    const otpError = validateOtp(otp);
    if (otpError) {
      setError(otpError);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await AuthService.verifyResetOtp(email, otpString);
      toast.success('OTP verified!');
      navigate('/reset-password', { state: { email, otp: otpString } });
    } catch (err: unknown) {
      let errMsg = 'Invalid OTP. Please try again.';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setError(errMsg);
      toast.error(errMsg);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f4f7fb] font-sans relative overflow-hidden p-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="absolute top-20 right-20 w-40 h-40 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-px bg-blue-900"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-blue-900"></div>
        <div className="absolute inset-4 rounded-full border border-blue-900"></div>
      </div>
      <div className="absolute bottom-20 left-20 w-60 h-60 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-px bg-blue-900"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-blue-900"></div>
        <div className="absolute inset-10 rounded-full border border-blue-900"></div>
      </div>

      <div className="flex items-center gap-2 mb-8 relative z-10">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
          <Box className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">DevCollab</span>
      </div>

      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 relative z-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Verify your identity</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            We've sent a 4-digit verification code to <br />
            <span className="font-bold text-slate-700">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleContinue} className="w-full">
          <div className="flex justify-center gap-2 sm:gap-4 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className="w-12 h-14 sm:w-14 sm:h-16 border border-slate-300 rounded-xl text-center text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm disabled:opacity-50"
                placeholder="-"
              />
            ))}
          </div>

          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-200 mb-6">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'VERIFYING...' : 'Verify & Continue'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 font-medium mb-8">
          Didn't receive the code?{' '}
          <button 
            onClick={handleResend}
            disabled={isLoading || resendTimer > 0}
            className="text-blue-600 font-bold hover:text-blue-700 disabled:text-blue-400 transition-colors ml-1"
          >
            {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
          </button>
        </div>

        <div className="pt-6 border-t border-slate-100 text-center">
          <a href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 text-center w-full">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          &copy; 2024 DevCollab Infrastructure
        </p>
      </div>
    </div>
  );
};
