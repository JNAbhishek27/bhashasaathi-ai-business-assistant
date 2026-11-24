import { useState } from 'react';
import { MotionConfig, motion } from 'motion/react';
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  MessageSquareText,
  Mic,
  ReceiptIndianRupee,
  RotateCcw,
  Store,
} from 'lucide-react';
import { AdvisorView } from './components/AdvisorView';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { RecordExpenseModal, RecordSaleModal } from './components/Modals';
import { ReportsView } from './components/ReportsView';
import { TransactionsView } from './components/TransactionsView';
import { VoiceAssistantView } from './components/VoiceAssistantView';
import { useShopStore } from './hooks/useShopStore';
import { TRANSLATIONS } from './i18n/translations';
import type { Language, NavTab } from './types';

export default function App() {
  const {
    shopData,
    language,
    setLanguage,
    resetDemoData,
    addProduct,
    updateProduct,
    deleteProduct,
    restockProduct,
    recordSale,
    recordExpense,
    deleteTransaction,
    todayDate,
    todaySummary,
    allTimeSummary,
    lowStockItems,
  } = useShopStore();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [queuedDemoCommand, setQueuedDemoCommand] = useState<string | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const t = TRANSLATIONS[language];

  const navItems: { id: NavTab; label: string; mobileLabel: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: t.nav.dashboard, mobileLabel: t.nav.dashboard.split(' ')[0], icon: LayoutDashboard },
    { id: 'assistant', label: t.nav.assistant, mobileLabel: t.nav.assistant.split(' ')[0], icon: Mic },
    { id: 'inventory', label: t.nav.inventory, mobileLabel: t.nav.inventory.split(' ')[0], icon: Boxes },
    { id: 'transactions', label: t.nav.transactions, mobileLabel: t.nav.transactions.split(' ')[0], icon: ReceiptIndianRupee },
    { id: 'advisor', label: t.nav.advisor, mobileLabel: t.nav.advisor.split(' ')[0], icon: MessageSquareText },
    { id: 'reports', label: t.nav.reports, mobileLabel: t.nav.reports.split(' ')[0], icon: BarChart3 },
  ];

  const handleRunDemoCommand = (command: string) => {
    setQueuedDemoCommand(command);
    setActiveTab('assistant');
  };

  const handleVoiceRestock = (
    productId: string | null,
    productName: string,
    quantity: number,
    unit: string
  ) => {
    const matched =
      (productId && shopData.inventory.find((i) => i.id === productId)) ||
      shopData.inventory.find((i) => i.name.toLowerCase() === productName.toLowerCase());

    if (matched) {
      restockProduct(matched.id, quantity);
    } else {
      addProduct({
        name: productName,
        category: 'Grains & Staples',
        unit,
        purchasePrice: 0,
        sellingPrice: 0,
        quantity,
        minThreshold: 5,
      });
    }
  };

  const currentNavLabel = navItems.find((n) => n.id === activeTab)?.label || t.nav.dashboard;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#FAF9F5] text-[#141B16] flex flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-[#E6E4DC]">
          <div className="p-5 border-b border-[#E6E4DC]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#14532D] text-white flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-lg text-[#141B16] leading-tight truncate">
                  {t.appName}
                </div>
                <div className="text-[11px] text-[#525B54] truncate">{shopData.shopName}</div>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-[#525B54] leading-snug">{t.tagline}</p>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full h-11 px-3.5 rounded-lg text-sm font-medium flex items-center justify-between transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#14532D] text-white'
                      : 'text-[#525B54] hover:bg-[#F3F2EC] hover:text-[#141B16]'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.id === 'inventory' && lowStockItems.length > 0 && (
                    <span
                      className={`font-mono-num text-xs ${
                        isActive ? 'text-emerald-100' : 'text-[#D97706] font-semibold'
                      }`}
                    >
                      {lowStockItems.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#E6E4DC] space-y-3">
            <div className="text-xs text-[#525B54]">
              <div className="font-medium text-[#141B16]">{shopData.shopName}</div>
              <div>{t.demoBadge}</div>
            </div>
            <button
              type="button"
              onClick={resetDemoData}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E4DC] bg-[#FAF9F5] hover:bg-[#F3F2EC] text-xs font-medium text-[#525B54] hover:text-[#141B16] inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetDemo}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-20 lg:pb-8">
          {/* Top Workspace Bar */}
          <header className="bg-white border-b border-[#E6E4DC] px-4 sm:px-6 py-3.5">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              {/* Left: Mobile Brand or Desktop Section Breadcrumb */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="lg:hidden flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#14532D] text-white flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="font-display font-bold text-base text-[#141B16] whitespace-nowrap">
                    {t.appName}
                  </span>
                </div>
                <div className="hidden lg:flex items-center gap-2 text-sm text-[#525B54]">
                  <span className="font-medium text-[#141B16]">{shopData.shopName}</span>
                  <span aria-hidden="true">/</span>
                  <span>{currentNavLabel}</span>
                </div>
              </div>

              {/* Right: Language Switcher + Primary Mic Shortcut */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div
                  className="flex items-center gap-0.5 p-1 bg-[#F3F2EC] rounded-lg"
                  role="group"
                  aria-label="Language selector"
                >
                  {(
                    [
                      { id: 'en', label: 'English' },
                      { id: 'kn', label: 'ಕನ್ನಡ' },
                      { id: 'hi', label: 'हिंदी' },
                    ] as { id: Language; label: string }[]
                  ).map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLanguage(lang.id)}
                      className={`h-8 px-2.5 sm:px-3 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                        language === lang.id
                          ? 'bg-white text-[#14532D] font-semibold shadow-xs'
                          : 'text-[#525B54] hover:text-[#141B16]'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('assistant')}
                  className="hidden sm:inline-flex h-10 px-3.5 rounded-lg bg-[#14532D] hover:bg-[#166534] text-white text-xs font-semibold items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{t.actions.speakNow}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Mobile Shop Info Strip */}
          <div className="lg:hidden px-4 py-2 bg-[#F3F2EC] border-b border-[#E6E4DC] flex items-center justify-between text-xs text-[#525B54]">
            <span>
              <strong className="text-[#141B16]">{shopData.shopName}</strong> · {t.demoBadge}
            </span>
            <button
              type="button"
              onClick={resetDemoData}
              className="text-[#14532D] font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.resetDemo}</span>
            </button>
          </div>

          {/* Viewport Body */}
          <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  t={t}
                  shopName={shopData.shopName}
                  isDemo={shopData.isDemo}
                  todaySummary={todaySummary}
                  inventory={shopData.inventory}
                  lowStockItems={lowStockItems}
                  transactions={shopData.transactions}
                  onNavigate={setActiveTab}
                  onRunDemoCommand={handleRunDemoCommand}
                  onOpenSaleModal={() => setShowSaleModal(true)}
                  onOpenExpenseModal={() => setShowExpenseModal(true)}
                />
              )}

              {activeTab === 'assistant' && (
                <VoiceAssistantView
                  t={t}
                  language={language}
                  todayDate={todayDate}
                  inventory={shopData.inventory}
                  transactions={shopData.transactions}
                  todaySummary={todaySummary}
                  queuedCommand={queuedDemoCommand}
                  onClearQueuedCommand={() => setQueuedDemoCommand(null)}
                  onConfirmSale={recordSale}
                  onConfirmExpense={recordExpense}
                  onConfirmRestock={handleVoiceRestock}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryView
                  t={t}
                  inventory={shopData.inventory}
                  onAddProduct={addProduct}
                  onUpdateProduct={updateProduct}
                  onDeleteProduct={deleteProduct}
                  onRestockProduct={restockProduct}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsView
                  t={t}
                  transactions={shopData.transactions}
                  inventory={shopData.inventory}
                  onOpenSaleModal={() => setShowSaleModal(true)}
                  onOpenExpenseModal={() => setShowExpenseModal(true)}
                  onDeleteTransaction={deleteTransaction}
                />
              )}

              {activeTab === 'advisor' && (
                <AdvisorView
                  t={t}
                  language={language}
                  shopData={shopData}
                  todayDate={todayDate}
                  todaySummary={todaySummary}
                  allTimeSummary={allTimeSummary}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  t={t}
                  transactions={shopData.transactions}
                  inventory={shopData.inventory}
                />
              )}
            </motion.div>
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-[60px] bg-white border-t border-[#E6E4DC] grid grid-cols-6"
          aria-label="Mobile navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium cursor-pointer transition-colors ${
                  isActive ? 'text-[#14532D]' : 'text-[#525B54]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25]' : ''}`} />
                <span className="truncate max-w-full">{item.mobileLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Modals */}
        {showSaleModal && (
          <RecordSaleModal
            inventory={shopData.inventory}
            onClose={() => setShowSaleModal(false)}
            onSave={(data) => recordSale({ ...data, source: 'manual' })}
          />
        )}

        {showExpenseModal && (
          <RecordExpenseModal
            onClose={() => setShowExpenseModal(false)}
            onSave={(data) => recordExpense({ ...data, source: 'manual' })}
          />
        )}
      </div>
    </MotionConfig>
  );
}
