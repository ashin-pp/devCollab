import { AdminLayout } from '../../layouts/AdminLayout';
import { Search, ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight, Users, Activity, Ban, Loader2, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AdminService } from '../../api/admin/admin.service';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isBlocked: boolean;
  status?: string;
  createdAt: string;
}

export const AdminUserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ACTIVE, BLOCKED
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await AdminService.getUsers();
      // Map backend `status` to frontend `isBlocked` for UI state
      const mappedUsers = (response.data || []).map((user: any) => ({
        ...user,
        isBlocked: user.status === 'blocked'
      }));
      setUsers(mappedUsers);
    } catch (err: unknown) {
      let errMsg = 'Failed to fetch users';
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await AdminService.toggleUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully.`);
      // Update local state instead of refetching for speed
      setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !currentStatus, status: !currentStatus ? 'blocked' : 'active' } : u));
    } catch (err: unknown) {
      let errMsg = 'Failed to toggle status';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      }
      toast.error(errMsg);
    }
  };

  const totalUsers = users.length;
  const blockedUsers = users.filter(u => u.isBlocked).length;

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterStatus === 'ACTIVE') matchesFilter = !user.isBlocked;
    if (filterStatus === 'BLOCKED') matchesFilter = user.isBlocked;

    return matchesSearch && matchesFilter;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 if filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161b22] border border-[#30363d] text-white pl-11 pr-4 py-3 rounded-md focus:outline-none focus:border-amber-500 text-sm font-sans"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-[#161b22] border border-[#30363d] text-white pl-4 pr-10 py-3 rounded-md focus:outline-none focus:border-amber-500 text-sm font-bold tracking-wider cursor-pointer h-full"
            >
              <option value="ALL">ALL USERS</option>
              <option value="ACTIVE">ACTIVE ONLY</option>
              <option value="BLOCKED">BLOCKED ONLY</option>
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-500" />
                    <div className="font-mono text-xs tracking-widest uppercase">FETCHING_USER_DATA...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-500 font-mono text-xs tracking-widest uppercase">
                    {error}
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-mono text-xs tracking-widest uppercase">
                    NO_USERS_FOUND
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id} className={`hover:bg-[#0d1117]/50 transition-colors group ${user.isBlocked ? 'bg-red-500/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-slate-800 rounded border ${user.isBlocked ? 'border-red-500/30 text-red-500/50' : 'border-[#30363d] text-slate-500'} flex items-center justify-center shrink-0 relative`}>
                          {user.isBlocked && <div className="absolute inset-0 bg-red-500/20 z-10"></div>}
                          <UserIcon className="w-5 h-5 z-20" />
                        </div>
                        <div>
                          <div className={`font-bold text-sm ${user.isBlocked ? 'text-red-200' : 'text-white'}`}>{user.name}</div>
                          <div className={`text-[10px] tracking-wider font-mono ${user.isBlocked ? 'text-red-500/50' : 'text-slate-500'}`}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#30363d]/50 text-slate-400 border border-[#30363d] px-2 py-1 rounded text-[9px] font-bold tracking-wider uppercase">
                        USER
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '_').toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300 font-bold">
                      {user.isVerified ? 'VERIFIED' : 'PENDING'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-2 text-xs font-bold tracking-wider ${user.isBlocked ? 'text-red-400' : 'text-emerald-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                        {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isBlocked)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded transition-colors uppercase tracking-widest ${user.isBlocked
                          ? 'text-black bg-amber-500 hover:bg-amber-400 border border-amber-500'
                          : 'text-slate-400 border border-[#30363d] hover:bg-[#30363d]'
                          }`}
                      >
                        {user.isBlocked ? 'UNBLOCK' : 'BLOCK'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-[#0d1117] border-t border-[#30363d] p-4 flex items-center justify-between">
          <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            DISPLAYING: [ {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} ] OF {filteredUsers.length} ENTRIES
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center text-slate-500 border border-[#30363d] rounded hover:bg-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center font-bold rounded border ${currentPage === page
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'text-slate-400 border-[#30363d] hover:bg-[#30363d] transition-colors'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center text-slate-500 border border-[#30363d] rounded hover:bg-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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
          <div className="text-3xl font-bold text-white tracking-wider">{totalUsers}</div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500 p-6 rounded-lg relative overflow-hidden group shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <div className="absolute top-4 right-4 text-amber-500/30 group-hover:text-amber-500/50 transition-colors">
            <Activity className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-amber-500 tracking-widest uppercase mb-4">ACTIVE_NOW</div>
          <div className="text-3xl font-bold text-amber-500 tracking-wider">{totalUsers - blockedUsers}</div>
        </div>

        <div className="bg-red-500/5 border border-[#30363d] hover:border-red-500/30 p-6 rounded-lg relative overflow-hidden group transition-colors">
          <div className="absolute top-4 right-4 text-[#30363d] group-hover:text-red-500/30 transition-colors">
            <Ban className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 group-hover:text-red-400 transition-colors tracking-widest uppercase mb-4">BLOCKED_ACCOUNTS</div>
          <div className="text-3xl font-bold text-white tracking-wider">{blockedUsers}</div>
        </div>
      </div>

    </AdminLayout>
  );
};
