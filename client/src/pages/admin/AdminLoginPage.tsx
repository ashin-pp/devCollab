import { useState } from 'react';
import { ShieldAlert, User, Lock, Eye, EyeOff, ShieldCheck, Terminal, AlertTriangle, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AdminService } from '../../api/admin/admin.service';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

export const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await AdminService.login({ email, password });
      
      dispatch(setCredentials({
        user: { id: response.data.admin.id, name: 'System Admin', email: response.data.admin.email, role: 'admin' },
        accessToken: response.data.accessToken
      }));
      toast.success('Admin authenticated securely.');
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      let errMsg = 'Authentication failed. Unauthorized.';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center font-mono relative overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBoNDBWMGgtMXYzOWgtMzl2MXoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz4KPC9zdmc+')] pointer-events-none"></div>

      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Terminal className="w-5 h-5 text-amber-500" />
        <span className="text-amber-500 font-bold tracking-widest text-sm">DEVCOLLAB // ADMIN</span>
      </div>

      {/* Top Right */}
      <div className="absolute top-6 right-6">
        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-xs font-bold tracking-widest flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" />
          RESTRICTED AREA
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl shadow-black/50 relative z-10 overflow-hidden">
        
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-amber-500"></div>

        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wider mb-1">ADMIN ACCESS</h2>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase">Authorized Personnel Only</p>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-xs font-bold tracking-widest text-center uppercase">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                <span>Admin Identifier</span>
                <span className="text-slate-600">ID_REQ</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-3 bg-[#010409] border border-[#30363d] rounded text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" 
                  placeholder="Enter admin ID or email"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                <span>Security Key</span>
                <span className="text-slate-600">PWD_REQ</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-10 py-3 bg-[#010409] border border-[#30363d] rounded text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-sans" 
                  placeholder="••••••••••••••••"
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

            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-700 disabled:text-amber-500 text-black py-3 rounded font-bold text-sm tracking-widest transition-colors mt-6 uppercase">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'AUTHENTICATING...' : 'Authenticate'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 flex items-center justify-between text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            <a href="/admin/forgot-password" className="hover:text-amber-500 transition-colors">Reset Credentials</a>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              2FA Required
            </span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-[#010409] border-t border-[#30363d] p-3 px-8 flex items-center justify-between text-[10px] font-bold tracking-widest uppercase">
          <div className="flex items-center gap-2 text-emerald-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sys: Online</span>
          </div>
          <div className="text-slate-600">
            IP: 192.168.1.1
          </div>
        </div>
      </div>
    </div>
  );
};
