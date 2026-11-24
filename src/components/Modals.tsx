import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { getLocalDateString } from '../data/demoData';
import type { InventoryItem } from '../types';
import { formatINR } from '../utils/analytics';

interface RecordSaleModalProps {
  inventory: InventoryItem[];
  onClose: () => void;
  onSave: (data: {
    productId: string | null;
    productName: string;
    quantity: number;
    unit: string;
    totalAmount: number;
    date: string;
    note: string;
  }) => void;
}

export function RecordSaleModal({ inventory, onClose, onSave }: RecordSaleModalProps) {
  const defaultProduct = inventory[0];
  const [selectedId, setSelectedId] = useState<string>(defaultProduct?.id || 'custom');
  const [customName, setCustomName] = useState('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unit, setUnit] = useState<string>(defaultProduct?.unit || 'units');
  const [totalAmount, setTotalAmount] = useState<string>(
    defaultProduct ? String(defaultProduct.sellingPrice) : ''
  );
  const [date, setDate] = useState<string>(getLocalDateString());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const selectedProduct = inventory.find((i) => i.id === selectedId);

  const handleProductChange = (newId: string) => {
    setSelectedId(newId);
    const prod = inventory.find((i) => i.id === newId);
    const qtyNum = Number(quantity) || 1;
    if (prod) {
      setUnit(prod.unit);
      setTotalAmount(String(Math.round(prod.sellingPrice * qtyNum)));
    }
  };

  const handleQtyChange = (val: string) => {
    setQuantity(val);
    const qtyNum = Number(val);
    if (selectedProduct && qtyNum > 0) {
      setTotalAmount(String(Math.round(selectedProduct.sellingPrice * qtyNum)));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(quantity);
    const totalNum = Number(totalAmount);
    const name = selectedId === 'custom' ? customName.trim() : selectedProduct?.name || '';

    if (!name) {
      setError('Please enter or select a product name.');
      return;
    }
    if (!qtyNum || qtyNum <= 0) {
      setError('Please enter a valid quantity greater than 0.');
      return;
    }
    if (!totalNum || totalNum <= 0) {
      setError('Please enter a valid sale amount greater than 0.');
      return;
    }

    onSave({
      productId: selectedId === 'custom' ? null : selectedId,
      productName: name,
      quantity: qtyNum,
      unit: unit.trim() || 'units',
      totalAmount: totalNum,
      date,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white border border-[#E6E4DC] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E6E4DC]">
          <h3 className="text-lg font-semibold text-[#141B16]">Record New Sale</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#525B54] hover:bg-[#F3F2EC] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#525B54] mb-1.5">Product</label>
            <select
              value={selectedId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] bg-white text-sm text-[#141B16] focus:outline-none focus:ring-2 focus:ring-[#14532D]"
            >
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.quantity} {item.unit} avail · ₹{item.sellingPrice}/{item.unit})
                </option>
              ))}
              <option value="custom">Other / Custom Item</option>
            </select>
          </div>

          {selectedId === 'custom' && (
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Custom Item Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Biscuits Pack"
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Quantity</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={quantity}
                onChange={(e) => handleQtyChange(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm font-mono-num focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Total Sale Price (₹)</label>
              <input
                type="number"
                min="1"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm font-mono-num focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
            </div>
          </div>

          {selectedProduct && (
            <div className="px-3.5 py-2.5 rounded-lg bg-[#F3F2EC] text-xs text-[#525B54] flex items-center justify-between">
              <span>
                Stock after sale:{' '}
                <strong className="text-[#141B16] font-mono-num">
                  {Math.max(0, Math.round((selectedProduct.quantity - (Number(quantity) || 0)) * 100) / 100)}{' '}
                  {selectedProduct.unit}
                </strong>
              </span>
              <span>
                Est. Margin:{' '}
                <strong className="text-[#14532D] font-mono-num">
                  {formatINR((Number(totalAmount) || 0) - selectedProduct.purchasePrice * (Number(quantity) || 0))}
                </strong>
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#525B54] mb-1.5">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Customer name or payment note"
              className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-lg border border-[#E6E4DC] text-sm font-medium text-[#525B54] hover:bg-[#F3F2EC] whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 px-5 rounded-lg bg-[#14532D] text-white text-sm font-medium hover:bg-[#166534] whitespace-nowrap shrink-0"
            >
              Save Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface RecordExpenseModalProps {
  onClose: () => void;
  onSave: (data: {
    description: string;
    amount: number;
    category: string;
    date: string;
    note: string;
  }) => void;
}

const EXPENSE_CATEGORIES = [
  'Stock Purchase',
  'Transport',
  'Utilities',
  'Packaging',
  'Rent',
  'Staff & Wages',
  'General',
];

export function RecordExpenseModal({ onClose, onSave }: RecordExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Stock Purchase');
  const [date, setDate] = useState(getLocalDateString());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!description.trim()) {
      setError('Please enter what this expense was for.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid expense amount.');
      return;
    }
    onSave({
      description: description.trim(),
      amount: numAmount,
      category,
      date,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white border border-[#E6E4DC] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E6E4DC]">
          <h3 className="text-lg font-semibold text-[#141B16]">Record Expense</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#525B54] hover:bg-[#F3F2EC]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#525B54] mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Auto transport or Electricity bill"
              className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Amount (₹)</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="250"
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm font-mono-num focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#525B54] mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#525B54] mb-1.5">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Supplier or bill reference"
              className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-lg border border-[#E6E4DC] text-sm font-medium text-[#525B54] hover:bg-[#F3F2EC] whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 px-5 rounded-lg bg-[#14532D] text-white text-sm font-medium hover:bg-[#166534] whitespace-nowrap shrink-0"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ProductModalProps {
  initialProduct?: InventoryItem | null;
  onClose: () => void;
  onSave: (data: Omit<InventoryItem, 'id' | 'updatedAt'>) => void;
}

const PRODUCT_CATEGORIES = [
  'Grains & Staples',
  'Packaged Food',
  'Dairy & Fresh',
  'Oils & Ghee',
  'Beverages',
  'Personal Care',
  'Household',
  'Snacks',
];

const PRODUCT_UNITS = ['kg', 'packets', 'litres', 'pieces', 'boxes', 'grams'];

export function ProductModal({ initialProduct, onClose, onSave }: ProductModalProps) {
  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState(initialProduct?.category || 'Grains & Staples');
  const [unit, setUnit] = useState(initialProduct?.unit || 'kg');
  const [purchasePrice, setPurchasePrice] = useState(initialProduct ? String(initialProduct.purchasePrice) : '');
  const [sellingPrice, setSellingPrice] = useState(initialProduct ? String(initialProduct.sellingPrice) : '');
  const [quantity, setQuantity] = useState(initialProduct ? String(initialProduct.quantity) : '');
  const [minThreshold, setMinThreshold] = useState(initialProduct ? String(initialProduct.minThreshold) : '5');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const pPrice = Number(purchasePrice);
    const sPrice = Number(sellingPrice);
    const qty = Number(quantity);
    const minT = Number(minThreshold);

    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (isNaN(pPrice) || pPrice < 0 || isNaN(sPrice) || sPrice <= 0) {
      setError('Please enter valid purchase and selling prices.');
      return;
    }
    if (isNaN(qty) || qty < 0 || isNaN(minT) || minT < 0) {
      setError('Quantity and minimum stock threshold must be 0 or higher.');
      return;
    }

    onSave({
      name: name.trim(),
      category,
      unit,
      purchasePrice: pPrice,
      sellingPrice: sPrice,
      quantity: qty,
      minThreshold: minT,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white border border-[#E6E4DC] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E6E4DC]">
          <h3 className="text-lg font-semibold text-[#141B16]">
            {initialProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#525B54] hover:bg-[#F3F2EC]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#525B54] mb-1.5">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Basmati Rice"
              className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              >
                {PRODUCT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Purchase Price (₹)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="45"
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm font-mono-num focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Selling Price (₹)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="60"
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm font-mono-num focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Available Quantity</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="25"
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm font-mono-num focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">Low-Stock Alert At</label>
              <input
                type="number"
                step="1"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                placeholder="10"
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm font-mono-num focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-lg border border-[#E6E4DC] text-sm font-medium text-[#525B54] hover:bg-[#F3F2EC] whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 px-5 rounded-lg bg-[#14532D] text-white text-sm font-medium hover:bg-[#166534] whitespace-nowrap shrink-0"
            >
              {initialProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
