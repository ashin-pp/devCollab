import { ShieldAlert, TerminalSquare, Activity } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const AdminNavbar = () => {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop()?.toUpperCase() || 'DASHBOARD';

  return (
    <header className="h-16 px-8 border-b border-[#30363d] flex items-center justify-between shrink-0 bg-[#0d1117]">
      <div className="text-sm font-bold tracking-widest text-slate-300">
        DEVCOLLAB // {pageName}
      </div>
      <div className="flex items-center gap-4">
        <ShieldAlert className="w-4 h-4 text-slate-500 hover:text-amber-500 cursor-pointer transition-colors" />
        <TerminalSquare className="w-4 h-4 text-slate-500 hover:text-amber-500 cursor-pointer transition-colors" />
        <Activity className="w-4 h-4 text-slate-500 hover:text-amber-500 cursor-pointer transition-colors" />
      </div>
    </header>
  );
};
