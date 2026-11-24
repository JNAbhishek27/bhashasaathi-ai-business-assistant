import type { InventoryItem, Transaction } from '../types';

export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface FinancialSummary {
  revenue: number;
  cogs: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  transactionCount: number;
  salesCount: number;
  expenseCount: number;
}

export function computeSummary(transactions: Transaction[], inventory: InventoryItem[]): FinancialSummary {
  const inventoryMap = new Map(inventory.map((item) => [item.id, item]));
  let revenue = 0;
  let cogs = 0;
  let expenses = 0;
  let salesCount = 0;
  let expenseCount = 0;

  for (const tx of transactions) {
    if (tx.type === 'sale') {
      salesCount += 1;
      revenue += tx.totalAmount;
      if (typeof tx.costOfGoods === 'number') {
        cogs += tx.costOfGoods;
      } else if (tx.productId && tx.quantity) {
        const prod = inventoryMap.get(tx.productId);
        if (prod) {
          cogs += prod.purchasePrice * tx.quantity;
        }
      }
    } else {
      expenseCount += 1;
      expenses += tx.totalAmount;
    }
  }

  const grossProfit = Math.round((revenue - cogs) * 100) / 100;
  const netProfit = Math.round((grossProfit - expenses) * 100) / 100;

  return {
    revenue: Math.round(revenue * 100) / 100,
    cogs: Math.round(cogs * 100) / 100,
    expenses: Math.round(expenses * 100) / 100,
    grossProfit,
    netProfit,
    transactionCount: transactions.length,
    salesCount,
    expenseCount,
  };
}

export function getLowStockItems(inventory: InventoryItem[]): InventoryItem[] {
  return inventory
    .filter((item) => item.quantity <= item.minThreshold)
    .sort((a, b) => a.quantity / Math.max(1, a.minThreshold) - b.quantity / Math.max(1, b.minThreshold));
}

export interface DailySeriesPoint {
  date: string;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export function getDailySeries(
  transactions: Transaction[],
  inventory: InventoryItem[],
  days: number = 7
): DailySeriesPoint[] {
  const points: DailySeriesPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatLocalDate(d);
    const dayTx = transactions.filter((t) => t.date === dateStr);
    const summary = computeSummary(dayTx, inventory);
    const label = d.toLocaleDateString('en-IN', {
      weekday: days <= 7 ? 'short' : undefined,
      day: 'numeric',
      month: days > 7 ? 'short' : undefined,
    });
    points.push({
      date: dateStr,
      label,
      revenue: summary.revenue,
      expenses: summary.expenses,
      profit: summary.netProfit,
    });
  }

  return points;
}

export interface ProductSalesStat {
  productName: string;
  category: string;
  unit: string;
  unitsSold: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
}

export function getBestSellingProducts(
  transactions: Transaction[],
  inventory: InventoryItem[]
): ProductSalesStat[] {
  const inventoryMap = new Map(inventory.map((i) => [i.id, i]));
  const stats = new Map<string, ProductSalesStat>();

  for (const tx of transactions) {
    if (tx.type !== 'sale') continue;
    const key = tx.productId || tx.productName.toLowerCase();
    const existing = stats.get(key);
    const qty = tx.quantity ?? 1;
    let txCogs = tx.costOfGoods ?? 0;
    if (!tx.costOfGoods && tx.productId && tx.quantity) {
      const prod = inventoryMap.get(tx.productId);
      if (prod) txCogs = prod.purchasePrice * tx.quantity;
    }

    if (existing) {
      existing.unitsSold = Math.round((existing.unitsSold + qty) * 100) / 100;
      existing.revenue = Math.round((existing.revenue + tx.totalAmount) * 100) / 100;
      existing.cogs = Math.round((existing.cogs + txCogs) * 100) / 100;
      existing.grossProfit = Math.round((existing.revenue - existing.cogs) * 100) / 100;
    } else {
      stats.set(key, {
        productName: tx.productName,
        category: tx.category,
        unit: tx.unit || 'units',
        unitsSold: qty,
        revenue: tx.totalAmount,
        cogs: txCogs,
        grossProfit: Math.round((tx.totalAmount - txCogs) * 100) / 100,
      });
    }
  }

  return Array.from(stats.values()).sort((a, b) => b.revenue - a.revenue);
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export function getExpenseBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const totals = new Map<string, number>();
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    totalExpense += tx.totalAmount;
    totals.set(tx.category, (totals.get(tx.category) || 0) + tx.totalAmount);
  }

  return Array.from(totals.entries())
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

const MULTILINGUAL_PRODUCT_ALIASES: Record<string, string[]> = {
  rice: ['rice', 'akki', 'ಅಕ್ಕಿ', 'chawal', 'चावल', 'sona masoori', 'basmati'],
  wheat: ['wheat', 'atta', 'godhi', 'ಗೋಧಿ', 'ಗೋದಿ', 'गेहूँ', 'गेहूं', 'आटा'],
  sugar: ['sugar', 'sakkare', 'ಸಕ್ಕರೆ', 'cheeni', 'chini', 'चीनी', 'शक्कर'],
  maggi: ['maggi', 'maggie', 'ಮ್ಯಾಗಿ', 'मैगी', 'noodles'],
  milk: ['milk', 'haalu', 'ಹಾಲು', 'doodh', 'dudh', 'दूध'],
  'cooking oil': ['cooking oil', 'oil', 'enne', 'ಎಣ್ಣೆ', 'ಅಡುಗೆ ಎಣ್ಣೆ', 'tel', 'ತೆಲೆ', 'तेल', 'खाना पकाने का तेल'],
  'toor dal': ['toor dal', 'dal', 'togari bele', 'bele', 'ತೊಗರಿ ಬೇಳೆ', 'ಬೇಳೆ', 'दाल', 'तूर दाल', 'अरहर दाल'],
  'tea powder': ['tea powder', 'tea', 'chaha', 'ಚಹಾ', 'ಚಹಾ ಪುಡಿ', 'ಟೀ', 'चाय', 'चाय पत्ती'],
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsTerm(text: string, term: string): boolean {
  const isAscii = /^[a-z0-9\s]+$/i.test(term);
  if (isAscii) {
    const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i');
    return regex.test(text);
  }
  return text.includes(term);
}

export function matchInventoryProduct(
  productName: string | null | undefined,
  matchedProductId: string | null | undefined,
  inventory: InventoryItem[]
): InventoryItem | null {
  if (matchedProductId) {
    const byId = inventory.find((item) => item.id === matchedProductId);
    if (byId) return byId;
  }

  const normalized = (productName || '').trim().toLowerCase();
  if (!normalized || normalized.length < 2) return null;

  const exactMatch = inventory.find((item) => item.name.trim().toLowerCase() === normalized);
  if (exactMatch) return exactMatch;

  const wordMatch = inventory.find((item) => {
    const itemLower = item.name.trim().toLowerCase();
    return containsTerm(normalized, itemLower) || (normalized.length >= 3 && containsTerm(itemLower, normalized));
  });
  if (wordMatch) return wordMatch;

  for (const [canonical, aliases] of Object.entries(MULTILINGUAL_PRODUCT_ALIASES)) {
    if (aliases.some((alias) => containsTerm(normalized, alias))) {
      const aliasedItem = inventory.find((item) =>
        item.name.trim().toLowerCase().includes(canonical)
      );
      if (aliasedItem) return aliasedItem;
    }
  }

  return null;
}

function getDateDaysAgo(baseDateStr: string, daysAgo: number): string {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() - daysAgo);
  return formatLocalDate(dt);
}

export function buildAdvisorContext(
  shopName: string,
  inventory: InventoryItem[],
  transactions: Transaction[],
  todayDate: string
) {
  const weekStartStr = getDateDaysAgo(todayDate, 6);
  const monthStartStr = getDateDaysAgo(todayDate, 29);

  const todayTx = transactions.filter((t) => t.date === todayDate);
  const weekTx = transactions.filter((t) => t.date >= weekStartStr && t.date <= todayDate);
  const monthTx = transactions.filter((t) => t.date >= monthStartStr && t.date <= todayDate);

  const dates = transactions.map((t) => t.date).sort();

  const inventoryWithMargins = inventory.map((item) => {
    const profitPerUnit = Math.round((item.sellingPrice - item.purchasePrice) * 100) / 100;
    const marginPercent =
      item.sellingPrice > 0
        ? Math.round(((item.sellingPrice - item.purchasePrice) / item.sellingPrice) * 1000) / 10
        : 0;
    const stockValue = Math.round(item.purchasePrice * item.quantity * 100) / 100;
    const stockStatus =
      item.quantity <= 0
        ? 'out_of_stock'
        : item.quantity <= item.minThreshold
        ? 'low_stock'
        : 'in_stock';

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice,
      profitPerUnit,
      marginPercent,
      quantity: item.quantity,
      minThreshold: item.minThreshold,
      stockValue,
      stockStatus,
    };
  });

  const lowStockItems = getLowStockItems(inventory).map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    minThreshold: item.minThreshold,
    unit: item.unit,
    shortfallToThreshold: Math.max(0, Math.round((item.minThreshold - item.quantity) * 100) / 100),
  }));

  return {
    shopName,
    todayDate,
    dataCoverage: {
      totalTransactions: transactions.length,
      earliestDate: dates[0] || null,
      latestDate: dates[dates.length - 1] || null,
    },
    summaries: {
      today: computeSummary(todayTx, inventory),
      last7Days: computeSummary(weekTx, inventory),
      last30Days: computeSummary(monthTx, inventory),
      allTime: computeSummary(transactions, inventory),
    },
    lowStockItems,
    inventoryWithMargins,
    bestSellingLast7Days: getBestSellingProducts(weekTx, inventory),
    bestSellingAllTime: getBestSellingProducts(transactions, inventory),
    expenseBreakdownLast7Days: getExpenseBreakdown(weekTx),
    expenseBreakdownAllTime: getExpenseBreakdown(transactions),
    recentTransactions: transactions.slice(0, 20),
  };
}

export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.abs(Math.round(amount)));
  return `${isNegative ? '-' : ''}₹${formatted}`;
}
