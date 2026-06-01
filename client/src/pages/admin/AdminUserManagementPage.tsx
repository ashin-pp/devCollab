import { AdminLayout } from '../../layouts/AdminLayout';
import { Search, ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight, Users, Activity, Ban } from 'lucide-react';

export const AdminUserManagementPage = () => {
  return (
    <AdminLayout>
      
      {/* Header Section */}
      <div className="mb-8 border-b border-[#30363d] pb-6">
        <h1 className="text-[10px] font-bold text-amber-500 tracking-widest mb-2 uppercase">
          [ DIRECTORY_SYSTEM_v2.0 ]
        </h1>
        <div className="text-3xl font-bold text-white tracking-widest uppercase">
          USER_DIRECTORY
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search users by name, email, or ID..."
            className="w-full bg-[#161b22] border border-[#30363d] text-white pl-11 pr-4 py-3 rounded-md focus:outline-none focus:border-amber-500 text-sm font-sans"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <select className="appearance-none bg-[#161b22] border border-[#30363d] text-white pl-4 pr-10 py-3 rounded-md focus:outline-none focus:border-amber-500 text-sm font-bold tracking-wider cursor-pointer h-full">
              <option>NEWEST</option>
              <option>OLDEST</option>
              <option>STATUS</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button className="bg-[#161b22] border border-[#30363d] text-slate-400 hover:text-amber-500 hover:border-amber-500/50 p-3 rounded-md transition-colors flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] text-slate-500 font-bold tracking-widest uppercase border-b border-[#30363d] bg-[#0d1117]">
              <tr>
                <th className="px-6 py-4">USER</th>
                <th className="px-6 py-4">ROLE</th>
                <th className="px-6 py-4">JOIN DATE</th>
                <th className="px-6 py-4">LAST ACTIVE</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]">
              {/* Row 1 */}
              <tr className="hover:bg-[#0d1117]/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded border border-[#30363d] overflow-hidden shrink-0">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Alex_Vance_NODE</div>
                      <div className="text-[10px] text-slate-500 tracking-wider font-mono">ID: DEV-88392-X</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded text-[9px] font-bold tracking-wider uppercase">
                    LEAD ARCH
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400">2023_OCT_12</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-300 font-bold">02:44_GMT</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2 text-xs font-bold text-emerald-500 tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> ACTIVE
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-bold text-slate-400 border border-[#30363d] hover:bg-[#30363d] px-3 py-1.5 rounded transition-colors uppercase tracking-widest">
                    BLOCK
                  </button>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-[#0d1117]/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded border border-[#30363d] overflow-hidden shrink-0">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Elena_Rossi</div>
                      <div className="text-[10px] text-slate-500 tracking-wider font-mono">ID: DEV-44120-P</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-[#30363d]/50 text-slate-400 border border-[#30363d] px-2 py-1 rounded text-[9px] font-bold tracking-wider uppercase">
                    CONTRIBUTOR
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400">2023_NOV_01</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-300 font-bold">14:12_GMT</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-wider">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span> INACTIVE
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-bold text-slate-400 border border-[#30363d] hover:bg-[#30363d] px-3 py-1.5 rounded transition-colors uppercase tracking-widest">
                    BLOCK
                  </button>
                </td>
              </tr>

              {/* Row 3 - Blocked */}
              <tr className="hover:bg-[#0d1117]/50 transition-colors group bg-red-500/5">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded border border-red-500/30 overflow-hidden shrink-0 relative">
                      <div className="absolute inset-0 bg-red-500/20 z-10"></div>
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kovac" alt="Avatar" className="w-full h-full object-cover grayscale opacity-50" />
                    </div>
                    <div>
                      <div className="font-bold text-red-200 text-sm">H_Kovac_VOID</div>
                      <div className="text-[10px] text-red-500/50 tracking-wider font-mono">ID: DEV-00921-E</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-[#30363d]/50 text-slate-400 border border-[#30363d] px-2 py-1 rounded text-[9px] font-bold tracking-wider uppercase">
                    ADMIN
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400">2022_FEB_28</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500 font-bold">--:--_---</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2 text-xs font-bold text-red-400 tracking-wider">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> BLOCKED
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-bold text-black bg-amber-500 hover:bg-amber-400 border border-amber-500 px-3 py-1.5 rounded transition-colors uppercase tracking-widest">
                    UNBLOCK
                  </button>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-[#0d1117]/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded border border-[#30363d] overflow-hidden shrink-0">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=SarahK" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Sarah_K_101</div>
                      <div className="text-[10px] text-slate-500 tracking-wider font-mono">ID: DEV-11902-Z</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-[#30363d]/50 text-slate-400 border border-[#30363d] px-2 py-1 rounded text-[9px] font-bold tracking-wider uppercase">
                    MODERATOR
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400">2024_JAN_05</td>
                <td className="px-6 py-4 font-mono text-xs text-amber-500 font-bold">23:59_GMT</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2 text-xs font-bold text-emerald-500 tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> ACTIVE
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-bold text-slate-400 border border-[#30363d] hover:bg-[#30363d] px-3 py-1.5 rounded transition-colors uppercase tracking-widest">
                    BLOCK
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-[#0d1117] border-t border-[#30363d] p-4 flex items-center justify-between">
          <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            DISPLAYING: [ 1 - 4 ] OF 2,104 ENTRIES
          </div>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center text-slate-500 border border-[#30363d] rounded hover:bg-[#30363d] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 flex items-center justify-center bg-amber-500 text-black font-bold rounded">1</button>
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 border border-[#30363d] rounded hover:bg-[#30363d] transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 border border-[#30363d] rounded hover:bg-[#30363d] transition-colors">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-600">...</span>
            <button className="w-8 h-8 flex items-center justify-center text-slate-500 border border-[#30363d] rounded hover:bg-[#30363d] transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Bottom Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-lg relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-[#30363d] group-hover:text-slate-700 transition-colors">
            <Users className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">TOTAL_USERS</div>
          <div className="text-3xl font-bold text-white tracking-wider">2,104</div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500 p-6 rounded-lg relative overflow-hidden group shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <div className="absolute top-4 right-4 text-amber-500/30 group-hover:text-amber-500/50 transition-colors">
            <Activity className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-amber-500 tracking-widest uppercase mb-4">ACTIVE_NOW</div>
          <div className="text-3xl font-bold text-amber-500 tracking-wider">1,842</div>
        </div>

        <div className="bg-red-500/5 border border-[#30363d] hover:border-red-500/30 p-6 rounded-lg relative overflow-hidden group transition-colors">
          <div className="absolute top-4 right-4 text-[#30363d] group-hover:text-red-500/30 transition-colors">
            <Ban className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 group-hover:text-red-400 transition-colors tracking-widest uppercase mb-4">BLOCKED_ACCOUNTS</div>
          <div className="text-3xl font-bold text-white tracking-wider">42</div>
        </div>
      </div>

    </AdminLayout>
  );
};
