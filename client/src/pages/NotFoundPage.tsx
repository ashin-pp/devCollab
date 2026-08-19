import { Terminal, AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen w-full flex items-center justify-center font-mono relative overflow-hidden ${isAdminRoute ? 'bg-[#0d1117]' : 'bg-slate-900'}`}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBoNDBWMGgtMXYzOWgtMzl2MXoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz4KPC9zdmc+')] pointer-events-none"></div>

      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Terminal className={`w-5 h-5 ${isAdminRoute ? 'text-amber-500' : 'text-blue-500'}`} />
        <span className={`${isAdminRoute ? 'text-amber-500' : 'text-blue-500'} font-bold tracking-widest text-sm uppercase`}>DEVCOLLAB // {isAdminRoute ? 'ADMIN' : 'SYSTEM'}</span>
      </div>

      <div className="text-center z-10 px-6">
        <div className="mb-6 flex justify-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isAdminRoute ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' : 'bg-blue-500/10 border border-blue-500/20 text-blue-500'}`}>
            <AlertTriangle className="w-12 h-12" />
          </div>
        </div>
        
        <h1 className="text-8xl font-bold text-white mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-slate-300 tracking-widest mb-2 uppercase">Page Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-10 font-sans">
          The requested trajectory <span className="font-mono text-slate-400">{location.pathname}</span> does not exist in the current system state.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-sm tracking-widest transition-colors flex items-center justify-center gap-2 uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <button 
            onClick={() => navigate(isAdminRoute ? '/admin/login' : '/')}
            className={`w-full sm:w-auto px-8 py-3 text-black rounded font-bold text-sm tracking-widest transition-colors flex items-center justify-center gap-2 uppercase ${isAdminRoute ? 'bg-amber-500 hover:bg-amber-400' : 'bg-blue-500 hover:bg-blue-400'}`}
          >
            <Home className="w-4 h-4" />
            {isAdminRoute ? 'Admin Gateway' : 'Home Node'}
          </button>
        </div>
      </div>
    </div>
  );
};
