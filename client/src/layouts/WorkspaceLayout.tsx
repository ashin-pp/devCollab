import { ReactNode } from 'react';
import { 
  Rocket, Hash, MessageSquare, BarChart2, 
  Users, User, Bell, Settings, Grip, LayoutDashboard
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#edf2f9] border-r border-slate-200 flex flex-col shrink-0">
        {/* Workspace Header */}
        <div className="h-16 flex items-center px-6 gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shrink-0">
            <Rocket className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm leading-tight">Project Alpha</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Developer Workspace</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavLink 
            to="/workspace/channels" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`
            }
          >
            <Hash className="w-4 h-4" />
            Channels
          </NavLink>
          <NavLink 
            to="/workspace/dm" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`
            }
          >
            <MessageSquare className="w-4 h-4" />
            Direct Messages
          </NavLink>
          <NavLink 
            to="/workspace/polls" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`
            }
          >
            <BarChart2 className="w-4 h-4" />
            Polls
          </NavLink>
          <NavLink 
            to="/workspace/members" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`
            }
          >
            <Users className="w-4 h-4" />
            Members
          </NavLink>
        </nav>

        {/* Bottom Nav */}
        <div className="p-4 mt-auto space-y-1">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-600 hover:bg-slate-200/50'
              }`
            }
          >
            <User className="w-4 h-4" />
            PROFILE
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
             <Link to="/" className="font-bold text-xl text-blue-600 tracking-tight hover:opacity-80 transition-opacity">DevCollab</Link>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button className="hover:text-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="hover:text-slate-800 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="hover:text-slate-800 transition-colors">
              <Grip className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  );
};
