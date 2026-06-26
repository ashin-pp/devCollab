import { AdminLayout } from '../../layouts/AdminLayout';
import { Search, ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight, Users, UserCheck, Ban, Loader2, User as UserIcon, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminService } from '../../api/admin/admin.service';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

import Swal from 'sweetalert2';

import type { WorkspaceMember } from '../../types/workspace.types';

export const AdminWorkspaceMembersPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, APPROVED, PENDING, BLOCKED
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchMembers = async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const response = await AdminService.getWorkspaceMembers(workspaceId);
      setMembers(response.data || []);
    } catch (err: unknown) {
      let errMsg = 'Failed to fetch members';
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
    fetchMembers();
  }, [workspaceId]);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    if (!workspaceId) return;
    try {
      const action = newStatus === 'blocked' ? 'block' : 'unblock';
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you really want to ${action} this member?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: newStatus === 'blocked' ? '#ef4444' : '#10b981',
        cancelButtonColor: '#30363d',
        confirmButtonText: `Yes, ${action} them!`,
        background: '#161b22',
        color: '#fff'
      });

      if (result.isConfirmed) {
        await AdminService.updateWorkspaceMemberStatus(workspaceId, userId, newStatus);
        toast.success(`Member status updated to ${newStatus}`);
        setMembers(members.map(m => m.userId === userId ? { ...m, status: newStatus } : m));
      }
    } catch (err: unknown) {
      let errMsg = 'Failed to update status';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      }
      toast.error(errMsg);
    }
  };

  const totalMembers = members.length;
  const approvedMembers = members.filter(m => m.status === 'approved').length;
  const blockedMembers = members.filter(m => m.status === 'blocked').length;

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.userId.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterStatus === 'APPROVED') matchesFilter = member.status === 'approved';
    if (filterStatus === 'PENDING') matchesFilter = member.status === 'pending';
    if (filterStatus === 'BLOCKED') matchesFilter = member.status === 'blocked';

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  return (
    <AdminLayout>

      <button 
        onClick={() => navigate('/admin/workspaces')}
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold tracking-widest uppercase"
      >
        <ArrowLeft className="w-4 h-4" /> BACK_TO_WORKSPACES
      </button>

      <div className="mb-8 border-b border-[#30363d] pb-6">
        <h1 className="text-[10px] font-bold text-amber-500 tracking-widest mb-2 uppercase">
          [ DIRECTORY_SYSTEM_v2.0 ]
        </h1>
        <div className="text-3xl font-bold text-white tracking-widest uppercase flex items-center gap-4">
          WORKSPACE_MEMBERS
          <span className="text-sm font-mono text-slate-500 bg-[#161b22] px-3 py-1 rounded border border-[#30363d]">
            ID: {workspaceId?.substring(0, 8)}...
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search members by name, email, or ID..."
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
              <option value="ALL">ALL MEMBERS</option>
              <option value="APPROVED">APPROVED ONLY</option>
              <option value="PENDING">PENDING ONLY</option>
              <option value="BLOCKED">BLOCKED ONLY</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button className="bg-[#161b22] border border-[#30363d] text-slate-400 hover:text-amber-500 hover:border-amber-500/50 p-3 rounded-md transition-colors flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] text-slate-500 font-bold tracking-widest uppercase border-b border-[#30363d] bg-[#0d1117]">
              <tr>
                <th className="px-6 py-4">MEMBER</th>
                <th className="px-6 py-4">ROLE</th>
                <th className="px-6 py-4">JOIN DATE</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-500" />
                    <div className="font-mono text-xs tracking-widest uppercase">FETCHING_MEMBER_DATA...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-500 font-mono text-xs tracking-widest uppercase">
                    {error}
                  </td>
                </tr>
              ) : paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono text-xs tracking-widest uppercase">
                    NO_MEMBERS_FOUND
                  </td>
                </tr>
              ) : (
                paginatedMembers.map(member => (
                  <tr key={member.id} className={`hover:bg-[#0d1117]/50 transition-colors group ${member.status === 'blocked' ? 'bg-red-500/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-slate-800 rounded border ${member.status === 'blocked' ? 'border-red-500/30 text-red-500/50' : 'border-[#30363d] text-slate-500'} flex items-center justify-center shrink-0 relative overflow-hidden`}>
                          {member.status === 'blocked' && <div className="absolute inset-0 bg-red-500/20 z-10"></div>}
                          {member.userAvatar ? (
                            <img src={member.userAvatar} alt={member.userName} className="w-full h-full object-cover z-20 relative" />
                          ) : (
                            <UserIcon className="w-5 h-5 z-20 relative" />
                          )}
                        </div>
                        <div>
                          <div className={`font-bold text-sm ${member.status === 'blocked' ? 'text-red-200' : 'text-white'}`}>{member.userName}</div>
                          <div className={`text-[10px] tracking-wider font-mono ${member.status === 'blocked' ? 'text-red-500/50' : 'text-slate-500'}`}>{member.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-bold tracking-wider uppercase border ${member.role === 'owner' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-[#30363d]/50 text-slate-400 border-[#30363d]'}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {new Date(member.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '_').toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-2 text-xs font-bold tracking-wider ${member.status === 'blocked' ? 'text-red-400' : member.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'blocked' ? 'bg-red-500' : member.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {member.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== 'owner' ? (
                        <button
                          onClick={() => handleUpdateStatus(member.userId, member.status === 'blocked' ? 'approved' : 'blocked')}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded transition-colors uppercase tracking-widest ${member.status === 'blocked'
                            ? 'text-black bg-amber-500 hover:bg-amber-400 border border-amber-500'
                            : 'text-red-500 border border-[#30363d] hover:bg-[#30363d]'
                            }`}
                        >
                          {member.status === 'blocked' ? 'UNBLOCK' : 'BLOCK'}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          PROTECTED
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#0d1117] border-t border-[#30363d] p-4 flex items-center justify-between">
          <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            DISPLAYING: [ {Math.min((currentPage - 1) * itemsPerPage + 1, filteredMembers.length) || 0} - {Math.min(currentPage * itemsPerPage, filteredMembers.length)} ] OF {filteredMembers.length} ENTRIES
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-lg relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-[#30363d] group-hover:text-slate-700 transition-colors">
            <Users className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">TOTAL_MEMBERS</div>
          <div className="text-3xl font-bold text-white tracking-wider">{totalMembers}</div>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/30 p-6 rounded-lg relative overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <div className="absolute top-4 right-4 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">
            <UserCheck className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase mb-4">APPROVED</div>
          <div className="text-3xl font-bold text-emerald-500 tracking-wider">{approvedMembers}</div>
        </div>

        <div className="bg-red-500/5 border border-[#30363d] hover:border-red-500/30 p-6 rounded-lg relative overflow-hidden group transition-colors">
          <div className="absolute top-4 right-4 text-[#30363d] group-hover:text-red-500/30 transition-colors">
            <Ban className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 group-hover:text-red-400 transition-colors tracking-widest uppercase mb-4">BLOCKED</div>
          <div className="text-3xl font-bold text-white tracking-wider">{blockedMembers}</div>
        </div>
      </div>

    </AdminLayout>
  );
};
