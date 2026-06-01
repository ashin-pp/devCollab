import { LayoutDashboard, Server, Users, BarChart3, Wallet, LogOut, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'DASHBOARD', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'WORKSPACES', icon: Server, path: '/admin/workspaces' },
    { name: 'USERS', icon: Users, path: '/admin/users' },
    { name: 'SALES REPORT', icon: BarChart3, path: '/admin/sales' },
    { name: 'WALLET', icon: Wallet, path: '/admin/wallet' },
  ];

  return (
    <aside className="w-[260px] bg-[#161b22] border-r border-[#30363d] flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo Section */}
      <div className="h-20 px-6 flex flex-col justify-center border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 font-bold tracking-widest">DEVCOLLAB</span>
          <span className="text-xs text-slate-500">[V4.0.1]</span>
        </div>
        <div className="mt-1">
          <span className="bg-amber-500/20 text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase">
            Secure_Node
          </span>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-[#30363d] flex items-center gap-3">
        <div className="w-10 h-10 border border-amber-500/30 rounded overflow-hidden">
           <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=AdminBoss" alt="Root Admin" className="w-full h-full object-cover bg-[#010409]" />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-wider">ROOT_ADMIN</div>
          <div className="text-[10px] text-slate-500 tracking-widest uppercase">Sector-7G / Local</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <a 
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold tracking-widest transition-all ${
                isActive 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-[#30363d]/50'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-slate-500'}`} />
              {item.name}
            </a>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[#30363d] space-y-1">
        <a href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold tracking-widest text-slate-400 hover:text-white hover:bg-[#30363d]/50 transition-all">
          <Settings className="w-4 h-4 text-slate-500" />
          SETTINGS
        </a>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold tracking-widest text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4 text-slate-500" />
          LOG OUT
        </button>
      </div>
    </aside>
  );
};
