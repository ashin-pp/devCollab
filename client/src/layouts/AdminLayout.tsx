import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminNavbar } from '../components/admin/AdminNavbar';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex bg-[#0d1117] text-slate-300 font-mono overflow-hidden">
      
      {/* Sidebar Component */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#010409]">
        
        {/* Top Navbar Component */}
        <AdminNavbar />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="h-10 border-t border-[#30363d] bg-[#0d1117] flex items-center justify-between px-8 text-[10px] font-bold tracking-widest text-slate-500 uppercase shrink-0">
          <div>&copy; 2024 DEVCOLLAB INDUSTRIAL SYSTEMS [ENCRYPTED]</div>
          <div className="flex items-center gap-6">
            <span>LEGAL_PROVISIONS</span>
            <span>PRIVACY_ENFORCEMENT</span>
            <span className="flex items-center gap-2 text-emerald-500">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              SYSTEM_STATUS
            </span>
          </div>
        </footer>
      </main>

    </div>
  );
};
