import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import type { TranslationStrings } from '../i18n/translations';
import type { InventoryItem } from '../types';
import { formatINR } from '../utils/analytics';
import { ProductModal } from './Modals';

interface InventoryViewProps {
  t: TranslationStrings;
  inventory: InventoryItem[];
  onAddProduct: (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Omit<InventoryItem, 'id'>>) => void;
  onDeleteProduct: (id: string) => void;
  onRestockProduct: (id: string, addedQuantity: number) => void;
}

export function InventoryView({
  t,
  inventory,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRestockProduct,
}: InventoryViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [modalProduct, setModalProduct] = useState<InventoryItem | null | 'new'>(null);

  const categories = useMemo(() => {
    const set = new Set(inventory.map((i) => i.category));
    return Array.from(set).sort();
  }, [inventory]);

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesLow = !onlyLowStock || item.quantity <= item.minThreshold;
      return matchesSearch && matchesCat && matchesLow;
    });
  }, [inventory, search, categoryFilter, onlyLowStock]);

  const lowStockCount = inventory.filter((i) => i.quantity <= i.minThreshold).length;
  const totalStockValue = inventory.reduce((sum, i) => sum + i.purchasePrice * i.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#141B16]">{t.inventory.title}</h2>
          <p className="text-sm text-[#525B54]">{t.inventory.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setModalProduct('new')}
          className="h-11 px-4 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.actions.addProduct}</span>
        </button>
      </div>

      {/* Quick Inventory Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4">
          <div className="text-xs font-medium text-[#525B54]">{t.dashboard.productsInStock}</div>
          <div className="mt-1.5 text-2xl font-bold font-mono-num text-[#141B16]">
            {inventory.length}
          </div>
        </div>
        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4">
          <div className="text-xs font-medium text-[#525B54]">{t.dashboard.lowStockAlerts}</div>
          <div
            className={`mt-1.5 text-2xl font-bold font-mono-num ${
              lowStockCount > 0 ? 'text-[#D97706]' : 'text-[#14532D]'
            }`}
          >
            {lowStockCount}
          </div>
        </div>
        <div className="rounded-xl bg-white border border-[#E6E4DC] p-4">
          <div className="text-xs font-medium text-[#525B54]">Stock Cost Value</div>
          <div className="mt-1.5 text-2xl font-bold font-mono-num text-[#141B16]">
            {formatINR(totalStockValue)}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-xl bg-white border border-[#E6E4DC] p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#525B54] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.inventory.searchPlaceholder}
            className="w-full h-11 pl-10 pr-3 rounded-lg border border-[#E6E4DC] bg-[#FAF9F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-11 px-3 rounded-lg border border-[#E6E4DC] bg-white text-sm text-[#141B16]"
        >
          <option value="all">{t.inventory.allCategories}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`h-11 px-4 rounded-lg border text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
            onlyLowStock
              ? 'bg-amber-50 border-amber-300 text-[#D97706]'
              : 'bg-[#FAF9F5] border-[#E6E4DC] text-[#525B54] hover:text-[#141B16]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{t.inventory.lowStockOnly}</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl bg-white border border-[#E6E4DC] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="text-base font-semibold text-[#141B16]">{t.inventory.emptyTitle}</div>
            <p className="text-sm text-[#525B54]">{t.inventory.emptySubtitle}</p>
            <button
              type="button"
              onClick={() => setModalProduct('new')}
              className="mt-3 h-10 px-4 rounded-lg bg-[#14532D] text-white text-sm font-medium cursor-pointer"
            >
              {t.actions.addProduct}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6E4DC] bg-[#FAF9F5] text-xs font-medium text-[#525B54]">
                  <th className="py-3 px-4">{t.inventory.product}</th>
                  <th className="py-3 px-4 text-right">{t.inventory.purchasePrice}</th>
                  <th className="py-3 px-4 text-right">{t.inventory.sellingPrice}</th>
                  <th className="py-3 px-4 text-right">{t.inventory.margin}</th>
                  <th className="py-3 px-4 text-right">{t.inventory.stock}</th>
                  <th className="py-3 px-4">{t.inventory.status}</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E4DC] text-sm">
                {filtered.map((item) => {
                  const isOut = item.quantity <= 0;
                  const isLow = item.quantity <= item.minThreshold;
                  const marginPct =
                    item.sellingPrice > 0
                      ? Math.round(((item.sellingPrice - item.purchasePrice) / item.sellingPrice) * 100)
                      : 0;

                  return (
                    <tr key={item.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#141B16]">{item.name}</div>
                        <div className="text-xs text-[#525B54]">
                          {item.category} · Min {item.minThreshold} {item.unit}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-num text-[#525B54]">
                        {formatINR(item.purchasePrice)}/{item.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-num font-medium text-[#141B16]">
                        {formatINR(item.sellingPrice)}/{item.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-num text-[#14532D]">
                        {marginPct}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-num font-semibold text-[#141B16]">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#DC2626]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {t.inventory.outOfStockLabel}
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D97706]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {t.inventory.lowStockLabel}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#14532D]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.inventory.inStockLabel}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onRestockProduct(item.id, 10)}
                            className="h-9 px-2.5 rounded-lg border border-[#E6E4DC] hover:bg-[#F3F2EC] text-xs font-medium text-[#14532D] inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            title={`Add 10 ${item.unit}`}
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            <span>+10</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalProduct(item)}
                            className="h-9 w-9 rounded-lg border border-[#E6E4DC] hover:bg-[#F3F2EC] text-[#525B54] inline-flex items-center justify-center cursor-pointer"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(item.id)}
                            className="h-9 w-9 rounded-lg border border-[#E6E4DC] hover:bg-red-50 hover:border-red-200 text-[#525B54] hover:text-[#DC2626] inline-flex items-center justify-center cursor-pointer"
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalProduct && (
        <ProductModal
          initialProduct={modalProduct === 'new' ? null : modalProduct}
          onClose={() => setModalProduct(null)}
          onSave={(data) => {
            if (modalProduct === 'new') {
              onAddProduct(data);
            } else {
              onUpdateProduct(modalProduct.id, data);
            }
          }}
        />
      )}
    </div>
  );
}
