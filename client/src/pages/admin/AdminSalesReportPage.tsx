import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  Wallet,
} from 'lucide-react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { AdminService } from '../../api/admin/admin.service';
import { AdminDataTable, type AdminDataTableColumn } from '../../components/admin/AdminDataTable';

type SalesItem = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  createdAt: string;
};

type SalesSummary = {
  totalRevenue: number;
  successCount: number;
  failedCount: number;
  cancelledCount: number;
  currency: string;
};

const formatMoney = (amount: number, currency: string) => {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : `${currency} `;
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${symbol}0`;
  return `${symbol}${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
};

const statusClass = (status: string) => {
  if (status === 'success') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (status === 'failed') return 'bg-red-500/10 text-red-400 border-red-500/30';
  if (status === 'cancelled') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
};

export const AdminSalesReportPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<SalesItem[]>([]);
  const [planNames, setPlanNames] = useState<string[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [planFilter, setPlanFilter] = useState(searchParams.get('planName') || 'ALL');
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const itemsPerPage = 10;

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const response = await AdminService.getSalesReport({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        planName: planFilter === 'ALL' ? undefined : planFilter,
        from: from || undefined,
        to: to || undefined,
      });
      const data = response.data ?? response;
      setItems(data.items || []);
      setPlanNames(data.planNames || []);
      setSummary(data.summary || null);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      let errMsg = 'Failed to load sales report';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, planFilter, from, to]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (planFilter !== 'ALL') params.set('planName', planFilter);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    setSearchParams(params, { replace: true });
  }, [currentPage, statusFilter, planFilter, from, to, setSearchParams]);

  const downloadPdf = () => {
    if (items.length === 0) {
      toast.error('No transactions to download');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const marginX = 36;
    let y = 40;

    doc.setFontSize(14);
    doc.text('DevCollab Sales Report', marginX, y);
    y += 18;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      `Generated: ${new Date().toLocaleString('en-GB')} · Page ${currentPage}/${totalPages} · Showing ${items.length} row(s)`,
      marginX,
      y
    );
    y += 12;
    doc.text(
      `Filters: status=${statusFilter}, plan=${planFilter}, from=${from || '—'}, to=${to || '—'}`,
      marginX,
      y
    );
    y += 20;
    doc.setTextColor(0);

    const columns = [
      { label: 'Date', x: marginX },
      { label: 'User', x: marginX + 110 },
      { label: 'Plan', x: marginX + 280 },
      { label: 'Amount', x: marginX + 380 },
      { label: 'Status', x: marginX + 460 },
      { label: 'Order', x: marginX + 530 },
    ];

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    columns.forEach((col) => doc.text(col.label, col.x, y));
    y += 8;
    doc.setDrawColor(180);
    doc.line(marginX, y, 800, y);
    y += 14;
    doc.setFont('helvetica', 'normal');

    items.forEach((item) => {
      if (y > 540) {
        doc.addPage();
        y = 40;
      }

      const date = new Date(item.createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const user = (item.userName || item.userEmail || item.userId || 'Unknown').slice(0, 28);
      const plan = item.planName.slice(0, 18);
      const amount = formatMoney(item.amount, item.currency);
      const order = item.razorpayOrderId.slice(0, 22);

      doc.text(date, columns[0].x, y);
      doc.text(user, columns[1].x, y);
      doc.text(plan, columns[2].x, y);
      doc.text(amount, columns[3].x, y);
      doc.text(item.status, columns[4].x, y);
      doc.text(order, columns[5].x, y);
      y += 16;
    });

    doc.save(`devcollab-sales-page-${currentPage}.pdf`);
    toast.success('PDF downloaded');
  };

  const columns = useMemo<AdminDataTableColumn<SalesItem>[]>(
    () => [
      {
        id: 'date',
        header: <span className="font-bold">Date</span>,
        cellClassName: 'text-slate-400 font-mono text-xs whitespace-nowrap',
        cell: (item) =>
          new Date(item.createdAt).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
      },
      {
        id: 'user',
        header: <span className="font-bold">User</span>,
        cell: (item) => (
          <>
            <div className="text-white text-xs font-medium">
              {item.userName || 'Unknown'}
            </div>
            <div className="text-slate-500 text-[11px]">{item.userEmail || item.userId}</div>
          </>
        ),
      },
      {
        id: 'plan',
        header: <span className="font-bold">Plan</span>,
        cellClassName: 'text-slate-300 text-xs',
        cell: (item) => item.planName,
      },
      {
        id: 'amount',
        header: <span className="font-bold">Amount</span>,
        cellClassName: 'text-white font-mono text-xs',
        cell: (item) => formatMoney(item.amount, item.currency),
      },
      {
        id: 'status',
        header: <span className="font-bold">Status</span>,
        cell: (item) => (
          <span
            className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded ${statusClass(item.status)}`}
          >
            {item.status}
          </span>
        ),
      },
      {
        id: 'order',
        header: <span className="font-bold">Order</span>,
        cellClassName: 'text-slate-500 font-mono text-[11px] max-w-[140px] truncate',
        cell: (item) => <span title={item.razorpayOrderId}>{item.razorpayOrderId}</span>,
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-[#30363d] pb-6">
        <div>
          <h1 className="text-sm font-bold text-slate-400 tracking-widest mb-1">COMMERCE</h1>
          <div className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            SALES_REPORT
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-mono tracking-widest">
            {total} TRANSACTIONS
          </div>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={isLoading || items.length === 0}
            className="inline-flex items-center gap-2 px-3 py-2 text-[10px] font-bold tracking-widest uppercase rounded border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryTile
          label="REVENUE"
          value={formatMoney(summary?.totalRevenue ?? 0, summary?.currency || 'INR')}
          icon={<Wallet className="w-4 h-4" />}
        />
        <SummaryTile label="SUCCESS" value={String(summary?.successCount ?? 0)} />
        <SummaryTile label="FAILED" value={String(summary?.failedCount ?? 0)} />
        <SummaryTile label="CANCELLED" value={String(summary?.cancelledCount ?? 0)} />
      </div>

      <AdminDataTable
        compact
        columns={columns}
        rows={items}
        getRowKey={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Loading sales…"
        emptyMessage="NO_TRANSACTIONS_FOUND"
        toolbar={
          <div className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#0d1117] border border-[#30363d] text-xs text-white px-3 py-2 rounded tracking-widest uppercase"
              >
                <option value="ALL">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#0d1117] border border-[#30363d] text-xs text-white px-3 py-2 rounded tracking-widest"
              >
                <option value="ALL">All Plans</option>
                {planNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#0d1117] border border-[#30363d] text-xs text-white px-3 py-2 rounded"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#0d1117] border border-[#30363d] text-xs text-white px-3 py-2 rounded"
              />
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-[10px] text-slate-500 tracking-widest uppercase">
              Page {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 border border-[#30363d] rounded text-slate-400 hover:text-amber-500 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 border border-[#30363d] rounded text-slate-400 hover:text-amber-500 disabled:opacity-40"
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

const SummaryTile = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) => (
  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
    <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2 flex items-center gap-2">
      {icon}
      {label}
    </div>
    <div className="text-2xl font-bold text-white tracking-wider">{value}</div>
  </div>
);
