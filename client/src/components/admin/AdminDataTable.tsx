import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export type AdminDataTableColumn<T> = {
  id: string;
  header: ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  cell: (row: T) => ReactNode;
};

export type AdminDataTableProps<T> = {
  columns: AdminDataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  rowClassName?: (row: T) => string | undefined;
  footer?: ReactNode;
  toolbar?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function AdminDataTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  error,
  emptyMessage = 'NO_RESULTS_FOUND',
  loadingMessage = 'LOADING...',
  rowClassName,
  footer,
  toolbar,
  compact = false,
  className = '',
}: AdminDataTableProps<T>) {
  const cellPad = compact ? 'px-4 py-3' : 'px-6 py-4';
  const headPad = compact ? 'px-4 py-3' : 'px-6 py-4';
  const colSpan = Math.max(columns.length, 1);

  return (
    <div className={`bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden ${className}`}>
      {toolbar ? <div className="border-b border-[#30363d]">{toolbar}</div> : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[10px] text-slate-500 font-bold tracking-widest uppercase border-b border-[#30363d] bg-[#0d1117]">
            <tr>
              {columns.map((column) => (
                <th key={column.id} className={`${headPad} ${column.headerClassName ?? ''}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]">
            {isLoading ? (
              <tr>
                <td colSpan={colSpan} className={`${cellPad} py-12 text-center text-slate-500`}>
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-500" />
                  <div className="font-mono text-xs tracking-widest uppercase">{loadingMessage}</div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className={`${cellPad} py-12 text-center text-red-500 font-mono text-xs tracking-widest uppercase`}
                >
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className={`${cellPad} py-12 text-center text-slate-500 font-mono text-xs tracking-widest uppercase`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className={`hover:bg-[#0d1117]/50 transition-colors ${rowClassName?.(row) ?? ''}`}
                >
                  {columns.map((column) => (
                    <td key={column.id} className={`${cellPad} ${column.cellClassName ?? ''}`}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {footer ? <div className="bg-[#0d1117] border-t border-[#30363d]">{footer}</div> : null}
    </div>
  );
}
