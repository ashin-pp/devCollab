import { useState, useRef, useEffect } from 'react';
import { Box, Hash, Sparkles, RefreshCw, ArrowLeft, Mail, Loader2, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AuthService } from '../../api/auth/auth.service';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { isDigitOnly, validateOtp } from '../../validation';

export const OtpVerificationPage = () => {
  const getInitialTimer = () => {
    const savedTime = localStorage.getItem('otpResendTimer');
    const savedTimestamp = localStorage.getItem('otpResendTimestamp');
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
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email = location.state?.email;
  const password = location.state?.password;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (resendTimer > 0) {
      localStorage.setItem('otpResendTimer', resendTimer.toString());
      localStorage.setItem('otpResendTimestamp', Date.now().toString());

      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      localStorage.removeItem('otpResendTimer');
      localStorage.removeItem('otpResendTimestamp');
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
      await AuthService.sendOtp(email);
      toast.success('OTP resent successfully!');
    } catch (err: unknown) {
      setResendTimer(0); // Reset timer if failed
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

  const handleVerify = async (e: React.FormEvent) => {
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
      await AuthService.verifyOtp(email, otpString);
      
      if (password) {
        const response = await AuthService.login({ email, password });
        dispatch(setCredentials({
          user: response.data.user,
          accessToken: response.data.accessToken
        }));
        toast.success("Account verified successfully!");
        navigate('/dashboard');
      } else {
        toast.success('Email successfully verified!');
        navigate('/login');
      }
      
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
    <div className="min-h-screen w-full flex bg-white font-sans">
      <div className="hidden lg:flex w-[45%] bg-[#0a0f1c] relative flex-col justify-between p-12 overflow-hidden text-white">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-800/40 via-[#0a0f1c] to-[#0a0f1c] pointer-events-none"></div>

        <div className="relative z-10">
          <a href="/" className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">DevCollab</span>
          </a>

          <h2 className="text-xl font-medium text-slate-400 mb-2">The workspace built for</h2>
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1] mb-12">
            Build the future<br />together
          </h1>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 mb-1">Structured technical discussions</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Deep dive into architecture and algorithms.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 mb-1">Integrated AI coding assistant</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Your 10x coding companion for rapid iteration.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 mb-1">Real-time synchronization</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Collaborative environments for global teams.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-16 bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm max-w-sm">
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            "The most powerful developer ecosystem I've used in a decade."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Sarah Jenkins</div>
              <div className="text-[10px] text-slate-400">CTO at NovaFlow</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-8 sm:p-12 relative bg-white">
        
        <div className="w-full max-w-[420px] text-center">
          
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Mail className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Verify your email</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            We've sent a 4-digit code to <span className="font-semibold text-slate-700">{email}</span>. Enter it below to continue.
          </p>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="w-full">
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

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-200 mb-6"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'VERIFYING...' : 'Verify & Continue'}
            </button>
          </form>

          <div className="text-sm text-slate-500 font-medium mb-12">
            Didn't receive the code?{' '}
            <button 
              onClick={handleResend} 
              disabled={isLoading || resendTimer > 0} 
              className="text-blue-600 font-bold hover:text-blue-700 disabled:text-blue-400 transition-colors ml-1"
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </div>

          <a href="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to register
          </a>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            &copy; 2024 DevCollab. Precision for developers.
          </p>
        </div>
      </div>
    </div>
  );
};
