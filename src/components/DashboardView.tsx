import { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Mic,
  Package,
  Plus,
  Receipt,
  X,
} from 'lucide-react';
import { DEMO_COMMANDS, type TranslationStrings } from '../i18n/translations';
import type { InventoryItem, NavTab, Transaction } from '../types';
import type { FinancialSummary } from '../utils/analytics';
import { formatINR, getDailySeries } from '../utils/analytics';
import { RevenueExpenseBarChart } from './Charts';

interface DashboardViewProps {
  t: TranslationStrings;
  shopName: string;
  isDemo: boolean;
  todaySummary: FinancialSummary;
  inventory: InventoryItem[];
  lowStockItems: InventoryItem[];
  transactions: Transaction[];
  onNavigate: (tab: NavTab) => void;
  onRunDemoCommand: (command: string) => void;
  onOpenSaleModal: () => void;
  onOpenExpenseModal: () => void;
}

const GUIDE_DISMISSED_KEY = 'bhashasaathi_guide_dismissed_v1';

export function DashboardView({
  t,
  shopName,
  isDemo,
  todaySummary,
  inventory,
  lowStockItems,
  transactions,
  onNavigate,
  onRunDemoCommand,
  onOpenSaleModal,
  onOpenExpenseModal,
}: DashboardViewProps) {
  const [showGuide, setShowGuide] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUIDE_DISMISSED_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const toggleGuide = (visible: boolean) => {
    setShowGuide(visible);
    try {
      localStorage.setItem(GUIDE_DISMISSED_KEY, visible ? '0' : '1');
    } catch {
      // ignore
    }
  };

  const weeklyData = getDailySeries(transactions, inventory, 7);
  const recentTransactions = transactions.slice(0, 6);
  const totalStockUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Dominant Focal Anchor: Voice-First Centerpiece */}
      <section className="rounded-xl overflow-hidden border border-[#14532D] bg-[#14532D] text-white">
        <div className="p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-100">
              <span>{shopName}</span>
              {isDemo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{t.demoBadge}</span>
                </>
              )}
              {!showGuide && (
                <>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => toggleGuide(true)}
                    className="underline hover:text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{t.onboarding.showGuide}</span>
                  </button>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t.dashboard.voiceHeroTitle}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              {t.dashboard.voiceHeroSubtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenSaleModal}
                className="h-11 px-4 rounded-lg bg-white/12 hover:bg-white/20 text-white text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.actions.recordSale}</span>
              </button>
              <button
                type="button"
                onClick={onOpenExpenseModal}
                className="h-11 px-4 rounded-lg bg-white/12 hover:bg-white/20 text-white text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>{t.actions.recordExpense}</span>
              </button>
            </div>
          </div>

          {/* Tactile Primary Voice Launchpad */}
          <div className="flex items-center gap-4 lg:flex-col lg:items-center shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('assistant')}
              className="group h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white text-[#14532D] hover:bg-emerald-50 flex items-center justify-center shadow-md transition-transform duration-150 active:scale-95 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              aria-label={t.actions.speakNow}
            >
              <Mic className="w-8 h-8 sm:w-9 sm:h-9 transition-transform duration-150 group-hover:scale-105" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('assistant')}
              className="h-10 px-4 rounded-lg bg-white text-[#14532D] hover:bg-emerald-50 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <span>{t.actions.speakNow}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Try Demo Commands Strip */}
        <div className="bg-white text-[#141B16] px-5 sm:px-7 py-4 border-t border-[#E6E4DC]">
          <div className="text-xs font-medium text-[#525B54] mb-2.5">
            {t.dashboard.tryDemoCommands}
          </div>
          <div className="flex flex-wrap gap-2">
            {DEMO_COMMANDS.map((item) => (
              <button
                key={item.command}
                type="button"
                onClick={() => onRunDemoCommand(item.command)}
                className="min-h-10 px-3 py-1.5 rounded-lg border border-[#E6E4DC] bg-[#FAF9F5] hover:bg-[#F3F2EC] hover:border-[#14532D]/40 text-xs text-[#141B16] text-left transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span className="font-semibold text-[#14532D] shrink-0">{item.label}</span>
                <span>{item.command}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Inline 3-Step Shopkeeper Onboarding Guide (Non-blocking, Dismissible) */}
      {showGuide && (
        <section className="rounded-xl bg-white border border-[#E6E4DC] p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#141B16]">{t.onboarding.title}</h2>
              <p className="text-xs text-[#525B54] mt-0.5">{t.onboarding.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleGuide(false)}
              className="h-9 px-2.5 rounded-lg text-xs font-medium text-[#525B54] hover:bg-[#F3F2EC] hover:text-[#141B16] inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.onboarding.dismiss}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#E6E4DC]">
            <div className="pt-2 space-y-1">
              <div className="text-sm font-semibold text-[#141B16] flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#14532D] shrink-0" />
                <span>{t.onboarding.step1Title}</span>
              </div>
              <p className="text-xs text-[#525B54] leading-relaxed">{t.onboarding.step1Desc}</p>
            </div>

            <div className="pt-2 space-y-1">
              <div className="text-sm font-semibold text-[#141B16] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#14532D] shrink-0" />
                <span>{t.onboarding.step2Title}</span>
              </div>
              <p className="text-xs text-[#525B54] leading-relaxed">{t.onboarding.step2Desc}</p>
            </div>

            <div className="pt-2 space-y-1 flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-[#141B16] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#14532D] shrink-0" />
                  <span>{t.onboarding.step3Title}</span>
                </div>
                <p className="text-xs text-[#525B54] leading-relaxed mt-1">{t.onboarding.step3Desc}</p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onRunDemoCommand(DEMO_COMMANDS[0].command)}
                  className="text-xs font-semibold text-[#14532D] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{t.onboarding.tryNow}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Primary KPI Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4 flex flex-col justify-between">
          <div className="text-xs font-medium text-[#525B54]">{t.dashboard.todayRevenue}</div>
          <div className="mt-2 text-2xl font-bold text-[#141B16] font-mono-num tabular-nums">
            {formatINR(todaySummary.revenue)}
          </div>
          <div className="mt-1.5 text-xs text-[#525B54]">
            {todaySummary.salesCount} sales today
          </div>
        </div>

        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4 flex flex-col justify-between">
          <div className="text-xs font-medium text-[#525B54]">{t.dashboard.todayExpenses}</div>
          <div className="mt-2 text-2xl font-bold text-[#DC2626] font-mono-num tabular-nums">
            {formatINR(todaySummary.expenses)}
          </div>
          <div className="mt-1.5 text-xs text-[#525B54]">
            COGS: <span className="font-mono-num">{formatINR(todaySummary.cogs)}</span>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4 flex flex-col justify-between">
          <div className="text-xs font-medium text-[#525B54]">{t.dashboard.estimatedProfit}</div>
          <div
            className={`mt-2 text-2xl font-bold font-mono-num tabular-nums ${
              todaySummary.netProfit >= 0 ? 'text-[#14532D]' : 'text-[#DC2626]'
            }`}
          >
            {formatINR(todaySummary.netProfit)}
          </div>
          <div className="mt-1.5 text-xs text-[#525B54]">{t.dashboard.profitSubtext}</div>
        </div>

        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4 flex flex-col justify-between">
          <div className="text-xs font-medium text-[#525B54]">{t.dashboard.totalTransactions}</div>
          <div className="mt-2 text-2xl font-bold text-[#141B16] font-mono-num tabular-nums">
            {transactions.length}
          </div>
          <div className="mt-1.5 text-xs text-[#525B54]">
            <span className="font-mono-num">{todaySummary.transactionCount}</span> recorded today
          </div>
        </div>

        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4 flex flex-col justify-between">
          <div className="text-xs font-medium text-[#525B54]">{t.dashboard.productsInStock}</div>
          <div className="mt-2 text-2xl font-bold text-[#141B16] font-mono-num tabular-nums">
            {inventory.length}
          </div>
          <div className="mt-1.5 text-xs text-[#525B54]">
            <span className="font-mono-num">{Math.round(totalStockUnits)}</span> total units
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('inventory')}
          className="rounded-xl bg-white border border-[#E6E4DC] hover:border-[#D97706]/50 p-4 flex flex-col justify-between text-left transition-colors cursor-pointer"
        >
          <div className="text-xs font-medium text-[#525B54]">{t.dashboard.lowStockAlerts}</div>
          <div
            className={`mt-2 text-2xl font-bold font-mono-num tabular-nums ${
              lowStockItems.length > 0 ? 'text-[#D97706]' : 'text-[#14532D]'
            }`}
          >
            {lowStockItems.length}
          </div>
          <div className="mt-1.5 text-xs text-[#525B54] inline-flex items-center gap-1">
            <span>{lowStockItems.length > 0 ? 'Needs restock' : 'All stocked'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </button>
      </section>

      {/* Chart + Low-Stock Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white border border-[#E6E4DC] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#141B16]">
              {t.dashboard.weeklySalesChart}
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="text-xs font-medium text-[#14532D] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{t.dashboard.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <RevenueExpenseBarChart
            data={weeklyData}
            revenueLabel={t.transactions.revenue}
            expenseLabel={t.transactions.expenses}
          />
        </div>

        {/* Low Stock Alert List */}
        <div className="rounded-xl bg-white border border-[#E6E4DC] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#141B16]">
              {t.dashboard.lowStockAlerts}
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('inventory')}
              className="text-xs font-medium text-[#14532D] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.actions.restock}
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <Package className="w-8 h-8 text-[#14532D] mb-2 opacity-75" />
              <p className="text-sm text-[#525B54]">{t.dashboard.allHealthy}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E6E4DC]">
              {lowStockItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#141B16] truncate">{item.name}</div>
                    <div className="text-xs text-[#525B54]">
                      {item.category} · Min {item.minThreshold} {item.unit}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-[#D97706] font-mono-num inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="rounded-xl bg-white border border-[#E6E4DC] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#141B16]">
            {t.dashboard.recentTransactions}
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('transactions')}
            className="text-xs font-medium text-[#14532D] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{t.dashboard.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6E4DC] text-xs font-medium text-[#525B54]">
                <th className="py-2.5 pr-4">Item / Description</th>
                <th className="py-2.5 pr-4">Type</th>
                <th className="py-2.5 pr-4">Qty</th>
                <th className="py-2.5 pr-4">Date</th>
                <th className="py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E4DC] text-sm">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-[#141B16]">{tx.productName}</div>
                    <div className="text-xs text-[#525B54]">{tx.category}</div>
                  </td>
                  <td className="py-3 pr-4">
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
                  <td className="py-3 pr-4 font-mono-num text-[#525B54]">
                    {tx.quantity ? `${tx.quantity} ${tx.unit || ''}` : '—'}
                  </td>
                  <td className="py-3 pr-4 font-mono-num text-xs text-[#525B54]">{tx.date}</td>
                  <td
                    className={`py-3 text-right font-semibold font-mono-num tabular-nums ${
                      tx.type === 'sale' ? 'text-[#141B16]' : 'text-[#DC2626]'
                    }`}
                  >
                    {tx.type === 'sale' ? '+' : '-'}
                    {formatINR(tx.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
