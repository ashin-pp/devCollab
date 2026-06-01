import { AdminLayout } from '../../layouts/AdminLayout';
import { Activity, Users, Wallet, Shield, MoreVertical, Search, Filter, Mail, Lock } from 'lucide-react';

export const AdminDashboardPage = () => {
  return (
    <AdminLayout>
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-[#30363d] pb-6">
        <div>
          <h1 className="text-sm font-bold text-slate-400 tracking-widest mb-1">SYSTEM_OVERVIEW</h1>
          <div className="text-xl font-bold text-white tracking-widest">
            NODE_STATUS: <span className="text-amber-500">OPERATIONAL [01-A]</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#161b22] border border-[#30363d] p-3 rounded">
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">SYSTEM_TIME</div>
            <div className="text-sm text-white font-mono">14:22:08 UTC</div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] p-3 rounded">
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">UPTIME</div>
            <div className="text-sm text-white font-mono">248:12:05</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat 1 */}
        <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[#30363d]">
            <Network className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">TOTAL_WORKSPACES</div>
          <div className="text-4xl font-bold text-white tracking-wider mb-2">1,248</div>
          <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
            <Activity className="w-3 h-3" /> +12.4% FROM_PREVIOUS
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[#30363d]">
            <Users className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">TOTAL_MEMBERS</div>
          <div className="text-4xl font-bold text-white tracking-wider mb-2">12.4k</div>
          <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
            <Activity className="w-3 h-3" /> +5.2k THIS_QUARTER
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[#30363d]">
            <Activity className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">ACTIVE_NODES</div>
          <div className="text-4xl font-bold text-white tracking-wider mb-2">892</div>
          <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <RefreshCwIcon className="w-3 h-3" /> REALTIME_SYNC_ON
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[#30363d]">
            <Wallet className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">REVENUE_FLOW</div>
          <div className="text-4xl font-bold text-white tracking-wider mb-2">$42.8k</div>
          <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
            <Activity className="w-3 h-3" /> PEAK_PERFORMANCE
          </div>
        </div>
      </div>

      {/* Middle Section (Chart + Logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <div className="flex justify-between items-center mb-8 border-b border-[#30363d] pb-4">
            <h2 className="text-sm font-bold text-slate-300 tracking-widest uppercase">PLATFORM_GROWTH_INDEX [DATA_VIZ]</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-[10px] font-bold bg-[#30363d] text-white rounded">24H</button>
              <button className="px-3 py-1 text-[10px] font-bold bg-amber-500 text-black rounded">7D</button>
              <button className="px-3 py-1 text-[10px] font-bold bg-[#30363d] text-white rounded">30D</button>
            </div>
          </div>
          
          {/* Fake Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2 md:gap-6 pt-4 border-l border-b border-[#30363d] px-4">
            {[40, 55, 45, 80, 60, 75, 65].map((h, i) => (
              <div key={i} className="w-full relative group">
                <div 
                  className={`w-full rounded-t-sm transition-all duration-500 ${i === 3 ? 'bg-amber-500/80' : 'bg-[#30363d] group-hover:bg-[#404852]'}`}
                  style={{ height: `${h}%` }}
                ></div>
                {i === 3 && <div className="absolute -top-6 w-full text-center text-[10px] text-amber-500 font-bold">7.8k</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 flex flex-col">
          <h2 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-6 border-b border-[#30363d] pb-4">SYS_LOG_AUDIT</h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            
            <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
              <div>TIMESTAMP</div>
              <div className="col-span-2">EVENT</div>
              <div className="text-right">STATUS</div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono items-center border-b border-[#30363d]/50 pb-3">
              <div className="text-slate-500">14:22:01</div>
              <div className="col-span-2 text-slate-300">WORKSPACE_GEN_A9</div>
              <div className="text-right text-emerald-500 font-bold">OK</div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono items-center border-b border-[#30363d]/50 pb-3">
              <div className="text-slate-500">14:21:45</div>
              <div className="col-span-2 text-slate-300">AUTH_TOKEN_REGEN</div>
              <div className="text-right text-emerald-500 font-bold">OK</div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono items-center border-b border-[#30363d]/50 pb-3 bg-red-500/5 -mx-2 px-2 py-1 rounded">
              <div className="text-slate-500">14:21:12</div>
              <div className="col-span-2 text-red-400">MEM_LOAD_CRITICAL</div>
              <div className="text-right text-red-500 font-bold">WARN</div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono items-center border-b border-[#30363d]/50 pb-3">
              <div className="text-slate-500">14:20:58</div>
              <div className="col-span-2 text-slate-300">SYS_INTEGRITY_CK</div>
              <div className="text-right text-emerald-500 font-bold">OK</div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono items-center border-b border-[#30363d]/50 pb-3">
              <div className="text-slate-500">14:20:33</div>
              <div className="col-span-2 text-slate-300">USR_ACCESS_DENIED</div>
              <div className="text-right text-amber-500 font-bold">REJ</div>
            </div>
          </div>
          <button className="w-full mt-4 py-2 text-[10px] font-bold tracking-widest text-slate-400 hover:text-amber-500 border-t border-[#30363d] pt-4 transition-colors">
            VIEW_ALL_LOGS
          </button>
        </div>

      </div>

    </AdminLayout>
  );
};

// Helper icon
const RefreshCwIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
