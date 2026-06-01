import { 
  Bell, Settings, Search, Building2, Rocket, 
  Users, ArrowRight, KeyRound, PlusCircle, TerminalSquare
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../api/auth/auth.service';
import { logout } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import { useEffect } from 'react';
import { api } from '../../api/axios';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import Swal from 'sweetalert2';


export const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Check if the user is still active or has been blocked by admin
    const checkStatus = async () => {
      try {
        await api.get('/auth/refresh');
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          if (err.response?.data?.message === 'Blocked by Admin' || err.response?.data?.error?.message === 'Blocked by Admin') {
            dispatch(logout());
            navigate('/login', { state: { error: "Your account has been blocked by an Administrator." } });
            return;
          }
        }
        dispatch(logout());
        navigate('/login');
      }
    };
    
    // Check immediately on mount
    checkStatus();

    // Poll every 15 seconds to simulate real-time block checks
    const interval = setInterval(checkStatus, 15000);

    return () => clearInterval(interval);
  }, [dispatch, navigate]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You will be securely logged out of your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6', // blue-500
      cancelButtonColor: '#ef4444', // red-500
      confirmButtonText: 'Yes, logout'
    });

    if (result.isConfirmed) {
      try {
        await AuthService.logout();
      } catch (err) {
        console.error("Logout error", err);
      } finally {
        dispatch(logout());
        navigate('/login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      {/* Top Navbar */}
      <nav className="w-full bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight text-blue-600">DevCollab</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          >
            Logout
          </button>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 ml-2">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Alex'}`} alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Engineer'}
          </h1>
          <p className="text-slate-500 font-medium">
            Select a workspace to continue your development workflow.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column (Workspaces & Banner) */}
          <div className="flex-1 space-y-8">
            
            {/* Joined Workspaces Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Joined Workspaces</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search for public workspace" 
                      className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                    2 ACTIVE
                  </span>
                </div>
              </div>

              {/* Workspace Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1 */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col h-full">
                  <div className="absolute top-4 right-4 text-slate-100 group-hover:text-slate-200 transition-colors">
                    <TerminalSquare className="w-16 h-16" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4 relative z-10">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Engineering HQ</h3>
                  <p className="text-sm text-slate-500 mb-8 relative z-10 flex-1">
                    Centralized hub for core platform services and architecture.
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 relative z-10">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                      <Users className="w-4 h-4" />
                      24 Members
                    </div>
                    <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                      Launch <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col h-full">
                  <div className="absolute top-4 right-4 text-slate-100 group-hover:text-slate-200 transition-colors">
                    <Rocket className="w-16 h-16" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-4 relative z-10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Project Titan</h3>
                  <p className="text-sm text-slate-500 mb-8 relative z-10 flex-1">
                    Next-gen distributed database system prototyping.
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 relative z-10">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                      <Users className="w-4 h-4" />
                      8 Members
                    </div>
                    <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                      Launch <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white mt-8 shadow-lg">
              {/* Abstract Dark Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 z-0"></div>
              <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-500/10 blur-[80px] z-0 pointer-events-none"></div>
              
              <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center min-h-[280px]">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 max-w-lg leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Elevate your team's development experience.
                </h2>
                <p className="text-slate-300 max-w-md leading-relaxed">
                  Built for high-performance engineering teams requiring precision and reliability.
                </p>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4">
              <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded text-sm font-semibold transition-colors">
                membership plan
              </button>
            </div>
            
          </div>

          {/* Right Column (Actions) */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            
            {/* Join Workspace */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-blue-600">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Join a Workspace</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Access an existing workspace using a unique invitation code.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Enter Workspace Code
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. DC-123-XYZ" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm">
                  Join Workspace
                </button>
              </div>
            </div>

            {/* Create Workspace */}
            <div className="bg-[#f8fafc] border border-slate-200 border-dashed rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-blue-600">
                <PlusCircle className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Create New Workspace</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Set up a new space for your team. Includes dedicated repositories, shared CI/CD, and workspace-wide secrets.
              </p>
              
              <button className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm">
                Create Workspace
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
