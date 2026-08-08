import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { AdminService } from '../../api/admin/admin.service';
import { AdminDataTable, type AdminDataTableColumn } from '../../components/admin/AdminDataTable';

type LedgerItem = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  type: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  description?: string;
  createdAt: string;
};

const formatMoney = (amount: number, currency: string) => {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : `${currency} `;
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${symbol}0`;
  return `${symbol}${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
};

const typeClass = (type: string) => {
  if (type === 'credit') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (type === 'debit') return 'bg-red-500/10 text-red-400 border-red-500/30';
  return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
};

export const AdminWalletPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<LedgerItem[]>([]);
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [creditCount, setCreditCount] = useState(0);
  const [debitCount, setDebitCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const itemsPerPage = 10;

  const fetchWallet = async () => {
    setIsLoading(true);
    try {
      const response = await AdminService.getWallet({
        page: currentPage,
        limit: itemsPerPage,
      });
      const data = response.data ?? response;
      setItems(data.items || []);
      setBalance(data.balance ?? 0);
      setCurrency(data.currency || 'INR');
      setCreditCount(data.creditCount ?? 0);
      setDebitCount(data.debitCount ?? 0);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      let errMsg = 'Failed to load wallet';
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
    void fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [currentPage, setSearchParams]);

  const columns = useMemo<AdminDataTableColumn<LedgerItem>[]>(
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
        id: 'type',
        header: <span className="font-bold">Type</span>,
        cell: (item) => (
          <span
            className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded ${typeClass(item.type)}`}
          >
            {item.type}
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
            <Wallet className="w-5 h-5 text-amber-500" />
            PLATFORM_WALLET
          </div>
        </div>
        <div className="text-xs text-slate-500 font-mono tracking-widest">
          {total} LEDGER_ENTRIES
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryTile
          label="BALANCE"
          value={formatMoney(balance, currency)}
          icon={<Wallet className="w-4 h-4" />}
        />
        <SummaryTile
          label="CREDITS"
          value={String(creditCount)}
          icon={<ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
        />
        <SummaryTile
          label="DEBITS"
          value={String(debitCount)}
          icon={<ArrowUpRight className="w-4 h-4 text-red-400" />}
        />
      </div>

      <AdminDataTable
        compact
        columns={columns}
        rows={items}
        getRowKey={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Loading wallet…"
        emptyMessage="NO_LEDGER_ENTRIES"
        toolbar={
          <div className="p-4">
            <p className="text-[11px] text-slate-500 tracking-wide">
              Credits land when a user successfully verifies a paid plan purchase.
            </p>
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
