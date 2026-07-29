import { useState, useEffect } from 'react';
import { ShieldAlert, Lock, Eye, EyeOff, Terminal, AlertTriangle, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminService } from '../../api/admin/admin.service';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { validateAdminResetPassword } from '../../validation';

export const AdminResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const otp = location.state?.otp;

  useEffect(() => {
    if (!email || !otp) {
      toast.error("Invalid session. Please start over.");
      navigate('/admin/forgot-password');
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validateAdminResetPassword(newPassword, confirmPassword);
    if (passwordError) return toast.error(passwordError);

    setIsLoading(true);
    try {
      await AdminService.resetPassword({ email, otp, newPassword, confirmPassword });
      toast.success("Security key updated successfully");
      navigate('/admin/login', { state: { message: "Password reset successful. Please login with your new key." } });
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Failed to update security key");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasMinLength = newPassword.length >= 12;
  const hasAlphaNumeric = /[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  
  const strengthScore = [hasMinLength, hasAlphaNumeric, hasUppercase, hasSpecialChar].filter(Boolean).length;
  const strengthText = strengthScore <= 1 ? 'Weak' : strengthScore <= 3 ? 'Medium' : 'Strong';

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
              <h2 className="text-xl font-bold text-white tracking-wider mb-1 uppercase">UPDATE_CREDENTIALS</h2>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase">Configure New Security Key</p>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                <span>New Security Key</span>
                <span className="text-slate-600">PWD_REQ</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-[#010409] border border-[#30363d] rounded text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-sans" 
                  placeholder="••••••••••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-amber-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="bg-[#010409] border border-[#30363d] p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Complexity</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${strengthScore <= 1 ? 'text-red-500' : strengthScore <= 3 ? 'text-amber-500' : 'text-emerald-500'}`}>{strengthText}</span>
              </div>
              <div className="flex gap-1 mb-3">
                <div className={`h-1 flex-1 rounded-sm ${strengthScore >= 1 ? (strengthScore <= 1 ? 'bg-red-500' : strengthScore <= 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-[#30363d]'}`}></div>
                <div className={`h-1 flex-1 rounded-sm ${strengthScore >= 2 ? (strengthScore <= 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-[#30363d]'}`}></div>
                <div className={`h-1 flex-1 rounded-sm ${strengthScore >= 3 ? (strengthScore <= 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-[#30363d]'}`}></div>
                <div className={`h-1 flex-1 rounded-sm ${strengthScore >= 4 ? 'bg-emerald-500' : 'bg-[#30363d]'}`}></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center gap-1.5 text-[10px] ${hasMinLength ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  <span>12+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] ${hasAlphaNumeric ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {hasAlphaNumeric ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  <span>Alpha-numeric</span>
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] ${hasUppercase ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  <span>Uppercase</span>
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] ${hasSpecialChar ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {hasSpecialChar ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  <span>Special char</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                <span>Confirm Security Key</span>
                <span className="text-slate-600">PWD_CFM</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-[#010409] border border-[#30363d] rounded text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-sans" 
                  placeholder="••••••••••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-amber-500 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button disabled={isLoading} type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded font-bold text-sm tracking-widest transition-colors mt-6 uppercase disabled:opacity-50">
              {isLoading ? "UPDATING..." : "APPLY_UPDATE"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

        <div className="bg-[#010409] border-t border-[#30363d] p-3 px-8 flex items-center justify-center text-[10px] font-bold tracking-widest text-slate-600 uppercase">
          SECURE CONNECTION ESTABLISHED
        </div>
      </div>
    </div>
  );
};
