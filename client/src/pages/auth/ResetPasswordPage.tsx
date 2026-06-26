import { useState, useEffect } from 'react';
import { Box, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../../api/auth/auth.service';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

export const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;

  useEffect(() => {
    if (!email || !otp) navigate('/forgot-password');
  }, [email, otp, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.resetPassword({ email, otp, newPassword, confirmPassword });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (error: unknown) {
      let errMsg = 'Failed to reset password';
      if (isAxiosError(error)) {
        errMsg = error.response?.data?.error?.message || error.response?.data?.message || errMsg;
      } else if (error instanceof Error) {
        errMsg = error.message;
      }
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f4f7fb] font-sans relative overflow-hidden p-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-8 relative z-10">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
          <Box className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">DevCollab</span>
      </div>

      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 relative z-10 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Reset Password</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Configure a new secure password for your DevCollab workspace account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600" /> : <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600" />}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password Strength</span>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Medium</span>
            </div>
            <div className="flex gap-1 mb-4">
              <div className="h-1 flex-1 bg-orange-500 rounded-full"></div>
              <div className="h-1 flex-1 bg-orange-500 rounded-full"></div>
              <div className="h-1 flex-1 bg-slate-200 rounded-full"></div>
              <div className="h-1 flex-1 bg-slate-200 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>8+ characters</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>One number</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Circle className="w-3.5 h-3.5 text-slate-300" />
                <span>One uppercase</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Circle className="w-3.5 h-3.5 text-slate-300" />
                <span>One special char</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600" /> : <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-200">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Resetting...' : 'Reset Password & Login'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <span className="text-xs text-slate-500 font-medium">Wait, I remember my password. </span>
          <a href="/login" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Back to Login</a>
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
