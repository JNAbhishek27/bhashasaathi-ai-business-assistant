import { useMemo, useState } from 'react';
import { getLocalDateString } from '../data/demoData';
import type { TranslationStrings } from '../i18n/translations';
import type { InventoryItem, Transaction } from '../types';
import {
  computeSummary,
  formatINR,
  getBestSellingProducts,
  getDailySeries,
  getExpenseBreakdown,
} from '../utils/analytics';
import { ExpenseBreakdownChart, RevenueExpenseBarChart } from './Charts';

interface ReportsViewProps {
  t: TranslationStrings;
  transactions: Transaction[];
  inventory: InventoryItem[];
}

type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export function ReportsView({ t, transactions, inventory }: ReportsViewProps) {
  const [period, setPeriod] = useState<ReportPeriod>('weekly');

  const todayStr = getLocalDateString();

  const periodTransactions = useMemo(() => {
    const now = new Date();
    if (period === 'daily') {
      return transactions.filter((tx) => tx.date === todayStr);
    }
    if (period === 'weekly') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      const startStr = getLocalDateString(start);
      return transactions.filter((tx) => tx.date >= startStr);
    }
    const monthStart = new Date(now);
    monthStart.setDate(now.getDate() - 29);
    const monthStartStr = getLocalDateString(monthStart);
    return transactions.filter((tx) => tx.date >= monthStartStr);
  }, [transactions, period, todayStr]);

  const summary = useMemo(
    () => computeSummary(periodTransactions, inventory),
    [periodTransactions, inventory]
  );

  const chartData = useMemo(() => {
    if (period === 'daily') return getDailySeries(transactions, inventory, 1);
    if (period === 'weekly') return getDailySeries(transactions, inventory, 7);
    return getDailySeries(transactions, inventory, 14);
  }, [transactions, inventory, period]);

  const expenseBreakdown = useMemo(
    () => getExpenseBreakdown(periodTransactions),
    [periodTransactions]
  );

  const bestSelling = useMemo(
    () => getBestSellingProducts(periodTransactions, inventory),
    [periodTransactions, inventory]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#141B16]">{t.reports.title}</h2>
          <p className="text-sm text-[#525B54]">{t.reports.subtitle}</p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F3F2EC] rounded-lg self-start sm:self-auto">
          {(
            [
              { id: 'daily', label: t.reports.daily },
              { id: 'weekly', label: t.reports.weekly },
              { id: 'monthly', label: t.reports.monthly },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id)}
              className={`h-9 px-3.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                period === item.id
                  ? 'bg-white text-[#141B16] shadow-xs'
                  : 'text-[#525B54] hover:text-[#141B16]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Period Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4">
          <div className="text-xs font-medium text-[#525B54]">{t.transactions.revenue}</div>
          <div className="mt-1.5 text-2xl font-bold font-mono-num text-[#141B16]">
            {formatINR(summary.revenue)}
          </div>
        </div>
        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4">
          <div className="text-xs font-medium text-[#525B54]">{t.transactions.cogs}</div>
          <div className="mt-1.5 text-2xl font-bold font-mono-num text-[#525B54]">
            {formatINR(summary.cogs)}
          </div>
        </div>
        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4">
          <div className="text-xs font-medium text-[#525B54]">{t.transactions.expenses}</div>
          <div className="mt-1.5 text-2xl font-bold font-mono-num text-[#DC2626]">
            {formatINR(summary.expenses)}
          </div>
        </div>
        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4">
          <div className="text-xs font-medium text-[#525B54]">{t.transactions.netProfit}</div>
          <div
            className={`mt-1.5 text-2xl font-bold font-mono-num ${
              summary.netProfit >= 0 ? 'text-[#14532D]' : 'text-[#DC2626]'
            }`}
          >
            {formatINR(summary.netProfit)}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white border border-[#E6E4DC] p-5">
          <h3 className="text-base font-semibold text-[#141B16] mb-4">{t.reports.salesTrend}</h3>
          <RevenueExpenseBarChart
            data={chartData}
            revenueLabel={t.transactions.revenue}
            expenseLabel={t.transactions.expenses}
          />
        </div>

        <div className="rounded-xl bg-white border border-[#E6E4DC] p-5">
          <h3 className="text-base font-semibold text-[#141B16] mb-4">
            {t.reports.expenseBreakdown}
          </h3>
          <ExpenseBreakdownChart items={expenseBreakdown} />
        </div>
      </div>

      {/* Best Selling & Inventory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white border border-[#E6E4DC] p-5">
          <h3 className="text-base font-semibold text-[#141B16] mb-4">{t.reports.bestSelling}</h3>
          {bestSelling.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#525B54]">
              No sales recorded in this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E4DC] text-xs font-medium text-[#525B54]">
                    <th className="py-2 pr-3">{t.inventory.product}</th>
                    <th className="py-2 pr-3 text-right">{t.reports.unitsSold}</th>
                    <th className="py-2 pr-3 text-right">{t.reports.revenueGenerated}</th>
                    <th className="py-2 text-right">{t.reports.grossProfit}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E4DC] text-sm">
                  {bestSelling.map((prod) => (
                    <tr key={prod.productName}>
                      <td className="py-3 pr-3 font-medium text-[#141B16]">{prod.productName}</td>
                      <td className="py-3 pr-3 text-right font-mono-num text-[#525B54]">
                        {prod.unitsSold} {prod.unit}
                      </td>
                      <td className="py-3 pr-3 text-right font-mono-num font-medium text-[#141B16]">
                        {formatINR(prod.revenue)}
                      </td>
                      <td className="py-3 text-right font-mono-num font-semibold text-[#14532D]">
                        {formatINR(prod.grossProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white border border-[#E6E4DC] p-5">
          <h3 className="text-base font-semibold text-[#141B16] mb-4">
            {t.reports.inventoryStatus}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6E4DC] text-xs font-medium text-[#525B54]">
                  <th className="py-2 pr-3">{t.inventory.product}</th>
                  <th className="py-2 pr-3 text-right">{t.inventory.stock}</th>
                  <th className="py-2 pr-3 text-right">Stock Value</th>
                  <th className="py-2 text-right">{t.inventory.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E4DC] text-sm">
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.minThreshold;
                  return (
                    <tr key={item.id}>
                      <td className="py-3 pr-3 font-medium text-[#141B16]">{item.name}</td>
                      <td className="py-3 pr-3 text-right font-mono-num text-[#525B54]">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 pr-3 text-right font-mono-num text-[#141B16]">
                        {formatINR(item.purchasePrice * item.quantity)}
                      </td>
                      <td
                        className={`py-3 text-right text-xs font-medium ${
                          isLow ? 'text-[#D97706]' : 'text-[#14532D]'
                        }`}
                      >
                        {isLow ? t.inventory.lowStockLabel : t.inventory.inStockLabel}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
