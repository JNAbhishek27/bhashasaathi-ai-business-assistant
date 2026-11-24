import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Receipt,
  Trash2,
} from 'lucide-react';
import { getLocalDateString } from '../data/demoData';
import type { TranslationStrings } from '../i18n/translations';
import type { InventoryItem, Transaction } from '../types';
import { computeSummary, formatINR } from '../utils/analytics';

interface TransactionsViewProps {
  t: TranslationStrings;
  transactions: Transaction[];
  inventory: InventoryItem[];
  onOpenSaleModal: () => void;
  onOpenExpenseModal: () => void;
  onDeleteTransaction: (id: string) => void;
}

type DateRangePreset = 'today' | '7days' | 'month' | 'all' | 'custom';
type TypeFilter = 'all' | 'sale' | 'expense';

export function TransactionsView({
  t,
  transactions,
  inventory,
  onOpenSaleModal,
  onOpenExpenseModal,
  onDeleteTransaction,
}: TransactionsViewProps) {
  const [datePreset, setDatePreset] = useState<DateRangePreset>('7days');
  const [customDate, setCustomDate] = useState(getLocalDateString());
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const today = getLocalDateString();

  const filtered = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    const sevenDaysStr = getLocalDateString(sevenDaysAgo);

    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    return transactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (datePreset === 'today') return tx.date === today;
      if (datePreset === '7days') return tx.date >= sevenDaysStr;
      if (datePreset === 'month') return tx.date >= monthStartStr;
      if (datePreset === 'custom') return tx.date === customDate;
      return true;
    });
  }, [transactions, typeFilter, datePreset, customDate, today]);

  const summary = useMemo(() => computeSummary(filtered, inventory), [filtered, inventory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#141B16]">{t.transactions.title}</h2>
          <p className="text-sm text-[#525B54]">{t.transactions.subtitle}</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSaleModal}
            className="h-11 px-4 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.actions.recordSale}</span>
          </button>
          <button
            type="button"
            onClick={onOpenExpenseModal}
            className="h-11 px-4 rounded-xl border border-[#E6E4DC] bg-white hover:bg-[#F3F2EC] text-[#141B16] text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-[#D97706]" />
            <span>{t.actions.recordExpense}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white border border-[#E6E4DC] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F3F2EC] rounded-lg">
          {(
            [
              { id: 'today', label: t.transactions.today },
              { id: '7days', label: t.transactions.last7Days },
              { id: 'month', label: t.transactions.thisMonth },
              { id: 'all', label: t.transactions.allTime },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDatePreset(item.id)}
              className={`h-9 px-3 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                datePreset === item.id
                  ? 'bg-white text-[#141B16] shadow-xs'
                  : 'text-[#525B54] hover:text-[#141B16]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <input
            type="date"
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value);
              setDatePreset('custom');
            }}
            aria-label="Filter by specific date"
            className={`h-9 px-2.5 rounded-md text-xs border ${
              datePreset === 'custom'
                ? 'bg-white border-[#14532D] text-[#141B16]'
                : 'bg-transparent border-transparent text-[#525B54]'
            }`}
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F3F2EC] rounded-lg self-start lg:self-auto">
          {(
            [
              { id: 'all', label: t.transactions.allTypes },
              { id: 'sale', label: t.transactions.salesOnly },
              { id: 'expense', label: t.transactions.expensesOnly },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTypeFilter(item.id)}
              className={`h-9 px-3 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                typeFilter === item.id
                  ? 'bg-white text-[#141B16] shadow-xs'
                  : 'text-[#525B54] hover:text-[#141B16]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accurate Financial Breakdown Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4">
          <div className="text-xs font-medium text-[#525B54]">{t.transactions.revenue}</div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold font-mono-num text-[#141B16]">
            {formatINR(summary.revenue)}
          </div>
          <div className="mt-1 text-xs text-[#525B54]">{summary.salesCount} sales</div>
        </div>

        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4">
          <div className="text-xs font-medium text-[#525B54]">{t.transactions.cogs}</div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold font-mono-num text-[#525B54]">
            {formatINR(summary.cogs)}
          </div>
          <div className="mt-1 text-xs text-[#525B54]">Purchase cost of items</div>
        </div>

        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4">
          <div className="text-xs font-medium text-[#525B54]">{t.transactions.expenses}</div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold font-mono-num text-[#DC2626]">
            {formatINR(summary.expenses)}
          </div>
          <div className="mt-1 text-xs text-[#525B54]">{summary.expenseCount} entries</div>
        </div>

        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4">
          <div className="text-xs font-medium text-[#525B54]">{t.transactions.netProfit}</div>
          <div
            className={`mt-1.5 text-xl sm:text-2xl font-bold font-mono-num ${
              summary.netProfit >= 0 ? 'text-[#14532D]' : 'text-[#DC2626]'
            }`}
          >
            {formatINR(summary.netProfit)}
          </div>
          <div className="mt-1 text-xs text-[#525B54]">Revenue − COGS − Expenses</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl bg-white border border-[#E6E4DC] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="text-base font-semibold text-[#141B16]">{t.transactions.emptyTitle}</div>
            <p className="text-sm text-[#525B54]">{t.transactions.emptySubtitle}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6E4DC] bg-[#FAF9F5] text-xs font-medium text-[#525B54]">
                  <th className="py-3 px-4">Item / Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E4DC] text-sm">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#141B16]">{tx.productName}</div>
                      <div className="text-xs text-[#525B54]">
                        {tx.category}
                        {tx.note ? ` · ${tx.note}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          tx.type === 'sale' ? 'text-[#14532D]' : 'text-[#DC2626]'
                        }`}
                      >
                        {tx.type === 'sale' ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {tx.type === 'sale' ? t.transactions.saleLabel : t.transactions.expenseLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-[#525B54]">
                      {tx.quantity ? `${tx.quantity} ${tx.unit || ''}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-xs text-[#525B54]">{tx.date}</td>
                    <td
                      className={`py-3.5 px-4 text-right font-semibold font-mono-num tabular-nums ${
                        tx.type === 'sale' ? 'text-[#141B16]' : 'text-[#DC2626]'
                      }`}
                    >
                      {tx.type === 'sale' ? '+' : '-'}
                      {formatINR(tx.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="h-9 w-9 rounded-lg border border-[#E6E4DC] hover:bg-red-50 hover:border-red-200 text-[#525B54] hover:text-[#DC2626] inline-flex items-center justify-center cursor-pointer"
                        aria-label={`Delete ${tx.productName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
