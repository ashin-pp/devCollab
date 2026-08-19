import { AdminLayout } from '../../layouts/AdminLayout';
import { Search, ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight, Server, Activity, Ban, Lock, Unlock, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminService } from '../../api/admin/admin.service';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

import Swal from 'sweetalert2';

import type { Workspace } from '../../types/workspace.types';
import { AdminDataTable, type AdminDataTableColumn } from '../../components/admin/AdminDataTable';

type PlanOption = { id: string; name: string };

export const AdminWorkspaceManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('filter') || 'ALL');
  const [filterPlanId, setFilterPlanId] = useState(searchParams.get('planId') || 'ALL');
  
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorkspaces, setTotalWorkspaces] = useState(0);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await AdminService.getPlans();
        const data = response.data ?? [];
        const list = Array.isArray(data) ? data : [];
        setPlans(
          list
            .filter((plan: PlanOption) => plan?.id && plan?.name)
            .map((plan: PlanOption) => ({ id: plan.id, name: plan.name }))
        );
      } catch {
        // Plan filter options are optional; table still works without them.
      }
    };
    loadPlans();
  }, []);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    try {
      let filterQuery = undefined;
      if (filterStatus === 'ACTIVE') filterQuery = 'active';
      if (filterStatus === 'DEACTIVATED') filterQuery = 'deactivated';

      const response = await AdminService.getWorkspaces({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        filter: filterQuery,
        planId: filterPlanId === 'ALL' ? undefined : filterPlanId,
        sortBy,
        sortOrder
      });
      
      const responseData = response.data.data || response.data;
      const mappedWorkspaces = Array.isArray(responseData) ? responseData : [];

      setWorkspaces(mappedWorkspaces);
      setTotalPages(response.data.totalPages || 1);
      setTotalWorkspaces(response.data.total || mappedWorkspaces.length);
    } catch (err: unknown) {
      let errMsg = 'Failed to fetch workspaces';
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
    fetchWorkspaces();
  }, [currentPage, debouncedSearchTerm, filterStatus, filterPlanId, sortBy, sortOrder]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (filterStatus !== 'ALL') params.set('filter', filterStatus);
    if (filterPlanId !== 'ALL') params.set('planId', filterPlanId);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    setSearchParams(params, { replace: true });
  }, [currentPage, debouncedSearchTerm, filterStatus, filterPlanId, sortBy, sortOrder, setSearchParams]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 inline ml-1 text-amber-500" /> 
      : <ArrowDown className="w-3 h-3 inline ml-1 text-amber-500" />;
  };

  const handleToggleStatus = async (workspaceId: string, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'deactivate' : 'activate';
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you really want to ${action} this workspace?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: currentStatus ? '#ef4444' : '#10b981',
        cancelButtonColor: '#30363d',
        confirmButtonText: `Yes, ${action} it!`,
        background: '#161b22',
        color: '#fff'
      });

      if (result.isConfirmed) {
        await AdminService.toggleWorkspaceStatus(workspaceId, !currentStatus);
        toast.success(`Workspace ${!currentStatus ? 'activated' : 'deactivated'} successfully.`);
        setWorkspaces(workspaces.map(w => w.id === workspaceId ? { ...w, isActive: !currentStatus } : w));
      }
    } catch (err: unknown) {
      let errMsg = 'Failed to toggle status';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      }
      toast.error(errMsg);
    }
  };

  const deactivatedWorkspaces = workspaces.filter(w => !w.isActive).length;
  const activeWorkspaces = workspaces.length - deactivatedWorkspaces;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus, filterPlanId]);

  const columns = useMemo<AdminDataTableColumn<Workspace>[]>(
    () => [
      {
        id: 'workspace',
        header: (
          <span className="cursor-pointer hover:text-amber-500 transition-colors" onClick={() => handleSort('name')}>
            WORKSPACE <SortIcon column="name" />
          </span>
        ),
        cell: (workspace) => (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-slate-800 rounded border ${!workspace.isActive ? 'border-red-500/30 text-red-500/50' : 'border-[#30363d] text-slate-500'} flex items-center justify-center shrink-0 relative`}>
              {!workspace.isActive && <div className="absolute inset-0 bg-red-500/20 z-10"></div>}
              <Server className="w-5 h-5 z-20" />
            </div>
            <div>
              <div className={`font-bold text-sm ${!workspace.isActive ? 'text-red-200' : 'text-white'}`}>{workspace.name}</div>
              <div className={`text-[10px] tracking-wider font-mono ${!workspace.isActive ? 'text-red-500/50' : 'text-slate-500'}`}>Owner: {workspace.ownerName}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'ownerPlan',
        header: 'OWNER_PLAN',
        cell: (workspace) => (
          <span className="inline-flex items-center px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-bold tracking-widest uppercase">
            {workspace.ownerPlanName || 'No plan'}
          </span>
        ),
      },
      {
        id: 'privacy',
        header: (
          <span className="cursor-pointer hover:text-amber-500 transition-colors" onClick={() => handleSort('privacy')}>
            PRIVACY <SortIcon column="privacy" />
          </span>
        ),
        cell: (workspace) => (
          <span className="flex items-center gap-1.5 text-slate-400 font-mono text-xs uppercase tracking-widest">
            {workspace.privacy === 'private' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {workspace.privacy}
          </span>
        ),
      },
      {
        id: 'members',
        header: 'MEMBERS',
        cell: (workspace) => (
          <div className="flex flex-col">
            <span className="text-white font-bold">{workspace.memberCount} / {workspace.maxMembers}</span>
            <div className="w-24 h-1.5 bg-[#30363d] rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${workspace.memberCount >= workspace.maxMembers ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (workspace.memberCount / workspace.maxMembers) * 100)}%` }}
              ></div>
            </div>
          </div>
        ),
      },
      {
        id: 'created',
        header: (
          <span className="cursor-pointer hover:text-amber-500 transition-colors" onClick={() => handleSort('createdAt')}>
            CREATED <SortIcon column="createdAt" />
          </span>
        ),
        cellClassName: 'font-mono text-xs text-slate-400',
        cell: (workspace) =>
          new Date(workspace.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '_').toUpperCase(),
      },
      {
        id: 'status',
        header: (
          <span className="cursor-pointer hover:text-amber-500 transition-colors" onClick={() => handleSort('isActive')}>
            STATUS <SortIcon column="isActive" />
          </span>
        ),
        cell: (workspace) => (
          <span className={`flex items-center gap-2 text-xs font-bold tracking-wider ${!workspace.isActive ? 'text-red-400' : 'text-emerald-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${!workspace.isActive ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            {!workspace.isActive ? 'DEACTIVATED' : 'ACTIVE'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'ACTIONS',
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        cell: (workspace) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => navigate(`/admin/workspaces/${workspace.id}/members`)}
              className="text-[10px] font-bold px-3 py-1.5 rounded transition-colors uppercase tracking-widest text-slate-400 border border-[#30363d] hover:bg-[#30363d] hover:text-white flex items-center gap-1.5"
            >
              <Eye className="w-3 h-3" /> MEMBERS
            </button>
            <button
              onClick={() => handleToggleStatus(workspace.id, workspace.isActive)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded transition-colors uppercase tracking-widest ${!workspace.isActive
                ? 'text-black bg-emerald-500 hover:bg-emerald-400 border border-emerald-500'
                : 'text-red-500 border border-[#30363d] hover:bg-[#30363d]'
                }`}
            >
              {!workspace.isActive ? 'ACTIVATE' : 'DEACTIVATE'}
            </button>
          </div>
        ),
      },
    ],
    [sortBy, sortOrder, workspaces, navigate]
  );

  return (
    <AdminLayout>

      <div className="mb-8 border-b border-[#30363d] pb-6">
        <h1 className="text-[10px] font-bold text-amber-500 tracking-widest mb-2 uppercase">
          [ DIRECTORY_SYSTEM_v2.0 ]
        </h1>
        <div className="text-3xl font-bold text-white tracking-widest uppercase">
          WORKSPACE_DIRECTORY
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-lg relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-[#30363d] group-hover:text-slate-700 transition-colors">
            <Server className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">TOTAL_WORKSPACES</div>
          <div className="text-3xl font-bold text-white tracking-wider">{totalWorkspaces}</div>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/30 p-6 rounded-lg relative overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <div className="absolute top-4 right-4 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">
            <Activity className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase mb-4">ACTIVE_NOW</div>
          <div className="text-3xl font-bold text-emerald-500 tracking-wider">{activeWorkspaces}</div>
        </div>

        <div className="bg-red-500/5 border border-[#30363d] hover:border-red-500/30 p-6 rounded-lg relative overflow-hidden group transition-colors">
          <div className="absolute top-4 right-4 text-[#30363d] group-hover:text-red-500/30 transition-colors">
            <Ban className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 group-hover:text-red-400 transition-colors tracking-widest uppercase mb-4">DEACTIVATED (PAGE)</div>
          <div className="text-3xl font-bold text-white tracking-wider">{deactivatedWorkspaces}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workspaces by name, owner, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161b22] border border-[#30363d] text-white pl-11 pr-4 py-3 rounded-md focus:outline-none focus:border-amber-500 text-sm font-sans"
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-[#161b22] border border-[#30363d] text-white pl-4 pr-10 py-3 rounded-md focus:outline-none focus:border-amber-500 text-sm font-bold tracking-wider cursor-pointer h-full"
            >
              <option value="ALL">ALL WORKSPACES</option>
              <option value="ACTIVE">ACTIVE ONLY</option>
              <option value="DEACTIVATED">DEACTIVATED ONLY</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterPlanId}
              onChange={(e) => setFilterPlanId(e.target.value)}
              className="appearance-none bg-[#161b22] border border-[#30363d] text-white pl-4 pr-10 py-3 rounded-md focus:outline-none focus:border-amber-500 text-sm font-bold tracking-wider cursor-pointer h-full min-w-[10rem]"
            >
              <option value="ALL">ALL PLANS</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name.toUpperCase()}
                </option>
              ))}
              <option value="none">NO PLAN</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button className="bg-[#161b22] border border-[#30363d] text-slate-400 hover:text-amber-500 hover:border-amber-500/50 p-3 rounded-md transition-colors flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        rows={workspaces}
        getRowKey={(workspace) => workspace.id}
        isLoading={isLoading}
        error={error}
        loadingMessage="FETCHING_WORKSPACE_DATA..."
        emptyMessage="NO_WORKSPACES_FOUND"
        rowClassName={(workspace) => (!workspace.isActive ? 'group bg-red-500/5' : 'group')}
        footer={
          <div className="p-4 flex items-center justify-between">
            <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              DISPLAYING: [ {totalWorkspaces === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalWorkspaces)} ] OF {totalWorkspaces} ENTRIES
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
        }
      />

    </AdminLayout>
  );
};
