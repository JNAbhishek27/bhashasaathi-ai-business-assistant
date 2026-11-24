export type Language = 'en' | 'kn' | 'hi';

export type NavTab =
  | 'dashboard'
  | 'assistant'
  | 'inventory'
  | 'transactions'
  | 'advisor'
  | 'reports';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minThreshold: number;
  updatedAt: string;
}

export type TransactionType = 'sale' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO timestamp
  productId?: string;
  productName: string;
  quantity?: number;
  unit?: string;
  totalAmount: number;
  costOfGoods?: number; // For accurate gross profit calculation on sales
  category: string; // Product category for sales, Expense category for expenses
  note?: string;
  source?: 'manual' | 'voice' | 'demo';
}

export interface ShopData {
  shopName: string;
  isDemo: boolean;
  inventory: InventoryItem[];
  transactions: Transaction[];
}

export type AssistantIntent =
  | 'record_sale'
  | 'record_expense'
  | 'add_inventory'
  | 'query_today_sales'
  | 'query_low_stock'
  | 'query_general'
  | 'unclear';

export type ValidationIssueCode =
  | 'UNCLEAR_INTENT'
  | 'MISSING_PRODUCT'
  | 'INVALID_QUANTITY'
  | 'INVALID_AMOUNT'
  | 'INSUFFICIENT_STOCK';

export interface InterpretedAction {
  intent: AssistantIntent;
  productName: string;
  matchedProductId: string | null;
  quantity: number | null;
  unit: string;
  totalPrice: number | null;
  priceCalculatedByApp?: boolean;
  isGeneralCounterSale?: boolean;
  expenseCategory: string;
  date: string;
  confidence: 'high' | 'medium' | 'low';
  needsConfirmation: boolean;
  replyMessage: string;
  clarificationQuestion: string | null;
  validationIssues?: ValidationIssueCode[];
}

export interface InterpretResponse {
  transcript: string;
  action: InterpretedAction;
}

export interface AdvisorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
