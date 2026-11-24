import { useCallback, useEffect, useMemo, useState } from 'react';
import { createDemoShopData, getLocalDateString } from '../data/demoData';
import type { InventoryItem, Language, ShopData, Transaction } from '../types';
import { computeSummary, getLowStockItems } from '../utils/analytics';

const STORAGE_KEY = 'bhashasaathi_shop_v1';
const LANG_KEY = 'bhashasaathi_lang_v1';

function loadShopData(): ShopData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ShopData;
      if (parsed && Array.isArray(parsed.inventory) && Array.isArray(parsed.transactions)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to demo dataset
  }
  return createDemoShopData();
}

function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'kn' || saved === 'hi') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'en';
}

export function useShopStore() {
  const [shopData, setShopData] = useState<ShopData>(() => loadShopData());
  const [language, setLanguageState] = useState<Language>(() => loadLanguage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shopData));
    } catch {
      // Ignore storage quota errors
    }
  }, [shopData]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const resetDemoData = useCallback(() => {
    const fresh = createDemoShopData();
    setShopData(fresh);
  }, []);

  const addProduct = useCallback(
    (input: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
      const newItem: InventoryItem = {
        ...input,
        id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        updatedAt: new Date().toISOString(),
      };
      setShopData((prev) => ({
        ...prev,
        inventory: [newItem, ...prev.inventory],
      }));
      return newItem;
    },
    []
  );

  const updateProduct = useCallback((id: string, updates: Partial<Omit<InventoryItem, 'id'>>) => {
    setShopData((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      ),
    }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setShopData((prev) => ({
      ...prev,
      inventory: prev.inventory.filter((item) => item.id !== id),
    }));
  }, []);

  const restockProduct = useCallback((id: string, addedQuantity: number) => {
    if (addedQuantity <= 0) return;
    setShopData((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.round((item.quantity + addedQuantity) * 100) / 100,
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    }));
  }, []);

  const recordSale = useCallback(
    (input: {
      productId?: string | null;
      productName: string;
      quantity: number;
      unit: string;
      totalAmount: number;
      date?: string;
      note?: string;
      source?: 'manual' | 'voice' | 'demo';
    }) => {
      setShopData((prev) => {
        const matchedProduct =
          (input.productId && prev.inventory.find((i) => i.id === input.productId)) ||
          prev.inventory.find(
            (i) => i.name.trim().toLowerCase() === input.productName.trim().toLowerCase()
          );

        const costOfGoods = matchedProduct
          ? Math.round(matchedProduct.purchasePrice * input.quantity * 100) / 100
          : 0;

        const newTx: Transaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'sale',
          date: input.date || getLocalDateString(),
          createdAt: new Date().toISOString(),
          productId: matchedProduct?.id,
          productName: matchedProduct ? matchedProduct.name : input.productName,
          quantity: input.quantity,
          unit: input.unit || matchedProduct?.unit || 'units',
          totalAmount: input.totalAmount,
          costOfGoods,
          category: matchedProduct?.category || 'General Sale',
          note: input.note,
          source: input.source || 'manual',
        };

        const updatedInventory = matchedProduct
          ? prev.inventory.map((item) =>
              item.id === matchedProduct.id
                ? {
                    ...item,
                    quantity: Math.max(0, Math.round((item.quantity - input.quantity) * 100) / 100),
                    updatedAt: new Date().toISOString(),
                  }
                : item
            )
          : prev.inventory;

        return {
          ...prev,
          inventory: updatedInventory,
          transactions: [newTx, ...prev.transactions],
        };
      });
    },
    []
  );

  const recordExpense = useCallback(
    (input: {
      description: string;
      amount: number;
      category: string;
      date?: string;
      note?: string;
      source?: 'manual' | 'voice' | 'demo';
    }) => {
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'expense',
        date: input.date || getLocalDateString(),
        createdAt: new Date().toISOString(),
        productName: input.description,
        totalAmount: input.amount,
        category: input.category || 'General',
        note: input.note,
        source: input.source || 'manual',
      };

      setShopData((prev) => ({
        ...prev,
        transactions: [newTx, ...prev.transactions],
      }));
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setShopData((prev) => {
      const tx = prev.transactions.find((t) => t.id === id);
      let updatedInventory = prev.inventory;
      if (tx && tx.type === 'sale' && tx.productId && tx.quantity) {
        updatedInventory = prev.inventory.map((item) =>
          item.id === tx.productId
            ? {
                ...item,
                quantity: Math.round((item.quantity + (tx.quantity || 0)) * 100) / 100,
                updatedAt: new Date().toISOString(),
              }
            : item
        );
      }
      return {
        ...prev,
        inventory: updatedInventory,
        transactions: prev.transactions.filter((t) => t.id !== id),
      };
    });
  }, []);

  const todayDate = getLocalDateString();

  const todaySummary = useMemo(() => {
    const todayTx = shopData.transactions.filter((t) => t.date === todayDate);
    return computeSummary(todayTx, shopData.inventory);
  }, [shopData.transactions, shopData.inventory, todayDate]);

  const allTimeSummary = useMemo(
    () => computeSummary(shopData.transactions, shopData.inventory),
    [shopData.transactions, shopData.inventory]
  );

  const lowStockItems = useMemo(() => getLowStockItems(shopData.inventory), [shopData.inventory]);

  return {
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
  };
}
