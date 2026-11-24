import type { Language } from '../types';

export interface TranslationStrings {
  appName: string;
  tagline: string;
  demoBadge: string;
  resetDemo: string;
  nav: {
    dashboard: string;
    assistant: string;
    inventory: string;
    transactions: string;
    advisor: string;
    reports: string;
  };
  actions: {
    speakNow: string;
    recordSale: string;
    recordExpense: string;
    addProduct: string;
    save: string;
    cancel: string;
    confirmSave: string;
    edit: string;
    delete: string;
    restock: string;
    send: string;
    tryCommand: string;
  };
  dashboard: {
    todayRevenue: string;
    todayExpenses: string;
    estimatedProfit: string;
    totalTransactions: string;
    productsInStock: string;
    lowStockAlerts: string;
    weeklySalesChart: string;
    recentTransactions: string;
    voiceHeroTitle: string;
    voiceHeroSubtitle: string;
    tryDemoCommands: string;
    viewAll: string;
    allHealthy: string;
    profitSubtext: string;
  };
  assistant: {
    title: string;
    subtitle: string;
    tapToSpeak: string;
    listening: string;
    processing: string;
    tapToStop: string;
    textPlaceholder: string;
    micUnavailable: string;
    confirmationTitle: string;
    heardLabel: string;
    stockImpact: string;
    uncertainWarning: string;
    transactionType: string;
    productName: string;
    quantity: string;
    unit: string;
    totalAmount: string;
    date: string;
    expenseCategory: string;
  };
  inventory: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    lowStockOnly: string;
    product: string;
    category: string;
    purchasePrice: string;
    sellingPrice: string;
    margin: string;
    stock: string;
    minStock: string;
    status: string;
    lowStockLabel: string;
    inStockLabel: string;
    outOfStockLabel: string;
    emptyTitle: string;
    emptySubtitle: string;
  };
  transactions: {
    title: string;
    subtitle: string;
    allTypes: string;
    salesOnly: string;
    expensesOnly: string;
    today: string;
    last7Days: string;
    thisMonth: string;
    allTime: string;
    revenue: string;
    cogs: string;
    expenses: string;
    netProfit: string;
    saleLabel: string;
    expenseLabel: string;
    emptyTitle: string;
    emptySubtitle: string;
  };
  advisor: {
    title: string;
    subtitle: string;
    placeholder: string;
    starterLabel: string;
    starters: string[];
  };
  reports: {
    title: string;
    subtitle: string;
    daily: string;
    weekly: string;
    monthly: string;
    salesTrend: string;
    expenseBreakdown: string;
    bestSelling: string;
    inventoryStatus: string;
    unitsSold: string;
    revenueGenerated: string;
    grossProfit: string;
  };
  onboarding: {
    title: string;
    subtitle: string;
    dismiss: string;
    showGuide: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    tryNow: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  en: {
    appName: 'BhashaSaathi',
    tagline: 'Your Shop. Your Language. Your AI Assistant.',
    demoBadge: 'Demo Data',
    resetDemo: 'Reset Demo',
    nav: {
      dashboard: 'Dashboard',
      assistant: 'Voice Assistant',
      inventory: 'Inventory',
      transactions: 'Sales & Expenses',
      advisor: 'AI Advisor',
      reports: 'Reports',
    },
    actions: {
      speakNow: 'Speak Command',
      recordSale: 'Record Sale',
      recordExpense: 'Record Expense',
      addProduct: 'Add Product',
      save: 'Save',
      cancel: 'Cancel',
      confirmSave: 'Confirm & Save',
      edit: 'Edit',
      delete: 'Delete',
      restock: 'Restock',
      send: 'Send',
      tryCommand: 'Try Command',
    },
    dashboard: {
      todayRevenue: "Today's Revenue",
      todayExpenses: "Today's Expenses",
      estimatedProfit: 'Estimated Profit',
      totalTransactions: 'Total Transactions',
      productsInStock: 'Products in Stock',
      lowStockAlerts: 'Low-Stock Alerts',
      weeklySalesChart: 'Weekly Sales & Expenses',
      recentTransactions: 'Recent Transactions',
      voiceHeroTitle: 'Speak to manage your shop',
      voiceHeroSubtitle: 'Record sales, add stock, or ask questions in English, ಕನ್ನಡ, or हिंदी.',
      tryDemoCommands: 'Try Demo Commands',
      viewAll: 'View all',
      allHealthy: 'All products are well stocked.',
      profitSubtext: 'After product cost & expenses',
    },
    assistant: {
      title: 'AI Voice Assistant',
      subtitle: 'Speak naturally in English, Kannada, or Hindi — confirm before saving.',
      tapToSpeak: 'Tap to Speak',
      listening: 'Listening... Tap to stop',
      processing: 'Understanding your command...',
      tapToStop: 'Stop Recording',
      textPlaceholder: 'Or type here: e.g. "I sold 2 kg rice for 120 rupees"',
      micUnavailable: 'Microphone access was blocked or unavailable. You can type your command below anytime.',
      confirmationTitle: 'Review & Confirm Before Saving',
      heardLabel: 'Understood Input',
      stockImpact: 'Inventory Impact',
      uncertainWarning: 'Please verify the highlighted details before saving.',
      transactionType: 'Action Type',
      productName: 'Product / Description',
      quantity: 'Quantity',
      unit: 'Unit',
      totalAmount: 'Total Amount (₹)',
      date: 'Date',
      expenseCategory: 'Category',
    },
    inventory: {
      title: 'Inventory Management',
      subtitle: 'Track stock levels, purchase costs, selling prices, and automatic alerts.',
      searchPlaceholder: 'Search products...',
      allCategories: 'All Categories',
      lowStockOnly: 'Low Stock Only',
      product: 'Product',
      category: 'Category',
      purchasePrice: 'Purchase Price',
      sellingPrice: 'Selling Price',
      margin: 'Margin',
      stock: 'Available Stock',
      minStock: 'Min Alert',
      status: 'Status',
      lowStockLabel: 'Low Stock',
      inStockLabel: 'In Stock',
      outOfStockLabel: 'Out of Stock',
      emptyTitle: 'No matching products',
      emptySubtitle: 'Try clearing your search or add a new product to your shop.',
    },
    transactions: {
      title: 'Sales & Expense Ledger',
      subtitle: 'Accurate daily revenue, cost of goods, expenses, and estimated profit.',
      allTypes: 'All',
      salesOnly: 'Sales',
      expensesOnly: 'Expenses',
      today: 'Today',
      last7Days: 'Last 7 Days',
      thisMonth: 'This Month',
      allTime: 'All Time',
      revenue: 'Revenue',
      cogs: 'Cost of Goods',
      expenses: 'Expenses',
      netProfit: 'Estimated Profit',
      saleLabel: 'Sale',
      expenseLabel: 'Expense',
      emptyTitle: 'No transactions in this range',
      emptySubtitle: 'Record a sale or expense manually or using the Voice Assistant.',
    },
    advisor: {
      title: 'Gemini AI Business Advisor',
      subtitle: 'Ask questions about your actual sales, margins, and restocking needs.',
      placeholder: 'Ask about today’s earnings, best sellers, or what to restock...',
      starterLabel: 'Suggested Questions',
      starters: [
        'How much did I earn today?',
        'What were my best-selling products?',
        'Which products should I restock?',
        'How much did I spend this week?',
        'Which products have the highest profit margin?',
      ],
    },
    reports: {
      title: 'Business Reports',
      subtitle: 'Interactive breakdown of sales, expenses, top products, and stock health.',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      salesTrend: 'Revenue vs Expenses Trend',
      expenseBreakdown: 'Expense Breakdown',
      bestSelling: 'Best-Selling Products',
      inventoryStatus: 'Inventory Valuation & Status',
      unitsSold: 'Units Sold',
      revenueGenerated: 'Revenue',
      grossProfit: 'Gross Profit',
    },
    onboarding: {
      title: 'How BhashaSaathi Works in 3 Steps',
      subtitle: 'Manage daily sales, stock, and profit without complex accounting software.',
      dismiss: 'Hide guide',
      showGuide: 'Quick guide',
      step1Title: '1. Speak or Type Naturally',
      step1Desc: 'Say “I sold 2 kg rice for 120 rupees” in English, ಕನ್ನಡ, or हिंदी.',
      step2Title: '2. Review & Confirm',
      step2Desc: 'Verify the extracted item, quantity, price, and stock change before saving.',
      step3Title: '3. Track Profit & Restock',
      step3Desc: 'Stock deducts automatically and Gemini Advisor answers questions from real data.',
      tryNow: 'Try a sample command',
    },
  },
  kn: {
    appName: 'ಭಾಷಾಸಾಥಿ',
    tagline: 'ನಿಮ್ಮ ಅಂಗಡಿ. ನಿಮ್ಮ ಭಾಷೆ. ನಿಮ್ಮ AI ಸಹಾಯಕ.',
    demoBadge: 'ಡೆಮೊ ಡೇಟಾ',
    resetDemo: 'ಡೆಮೊ ಮರುಹೊಂದಿಸಿ',
    nav: {
      dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      assistant: 'ಧ್ವನಿ ಸಹಾಯಕ',
      inventory: 'ದಾಸ್ತಾನು',
      transactions: 'ಮಾರಾಟ ಮತ್ತು ವೆಚ್ಚ',
      advisor: 'AI ಸಲಹೆಗಾರ',
      reports: 'ವರದಿಗಳು',
    },
    actions: {
      speakNow: 'ಮಾತನಾಡಿ',
      recordSale: 'ಮಾರಾಟ ದಾಖಲಿಸಿ',
      recordExpense: 'ವೆಚ್ಚ ದಾಖಲಿಸಿ',
      addProduct: 'ಉತ್ಪನ್ನ ಸೇರಿಸಿ',
      save: 'ಉಳಿಸಿ',
      cancel: 'ರದ್ದುಮಾಡಿ',
      confirmSave: 'ದೃಢೀಕರಿಸಿ ಮತ್ತು ಉಳಿಸಿ',
      edit: 'ತಿದ್ದುಪಡಿ',
      delete: 'ಅಳಿಸಿ',
      restock: 'ಸ್ಟಾಕ್ ಸೇರಿಸಿ',
      send: 'ಕಳುಹಿಸಿ',
      tryCommand: 'ಪ್ರಯತ್ನಿಸಿ',
    },
    dashboard: {
      todayRevenue: 'ಇಂದಿನ ಆದಾಯ',
      todayExpenses: 'ಇಂದಿನ ವೆಚ್ಚ',
      estimatedProfit: 'ಅಂದಾಜು ಲಾಭ',
      totalTransactions: 'ಒಟ್ಟು ವಹಿವಾಟುಗಳು',
      productsInStock: 'ದಾಸ್ತಾನಿನಲ್ಲಿರುವ ಉತ್ಪನ್ನಗಳು',
      lowStockAlerts: 'ಕಡಿಮೆ ಸ್ಟಾಕ್ ಎಚ್ಚರಿಕೆ',
      weeklySalesChart: 'ವಾರದ ಮಾರಾಟ ಮತ್ತು ವೆಚ್ಚ',
      recentTransactions: 'ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು',
      voiceHeroTitle: 'ನಿಮ್ಮ ಅಂಗಡಿಯನ್ನು ಧ್ವನಿಯಿಂದ ನಿರ್ವಹಿಸಿ',
      voiceHeroSubtitle: 'ಕನ್ನಡ, हिंदी ಅಥವಾ English ನಲ್ಲಿ ಮಾರಾಟ ದಾಖಲಿಸಿ ಅಥವಾ ಪ್ರಶ್ನೆ ಕೇಳಿ.',
      tryDemoCommands: 'ಡೆಮೊ ಆಜ್ಞೆಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ',
      viewAll: 'ಎಲ್ಲಾ ನೋಡಿ',
      allHealthy: 'ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳ ಸ್ಟಾಕ್ ಉತ್ತಮವಾಗಿದೆ.',
      profitSubtext: 'ಖರೀದಿ ವೆಚ್ಚ ಮತ್ತು ಖರ್ಚಿನ ನಂತರ',
    },
    assistant: {
      title: 'AI ಧ್ವನಿ ಸಹಾಯಕ',
      subtitle: 'ಕನ್ನಡ, हिंदी ಅಥವಾ English ನಲ್ಲಿ ಮಾತನಾಡಿ — ಉಳಿಸುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ.',
      tapToSpeak: 'ಮಾತನಾಡಲು ಒತ್ತಿರಿ',
      listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ನಿಲ್ಲಿಸಲು ಒತ್ತಿರಿ',
      processing: 'ನಿಮ್ಮ ಮಾತನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತಿದೆ...',
      tapToStop: 'ನಿಲ್ಲಿಸಿ',
      textPlaceholder: 'ಅಥವಾ ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ: ಉದಾ. "ಇಂದು 2 ಕೆಜಿ ಅಕ್ಕಿ 120 ರೂಪಾಯಿಗೆ ಮಾರಿದೆ"',
      micUnavailable: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಲಭ್ಯವಿಲ್ಲ. ನೀವು ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಬಹುದು.',
      confirmationTitle: 'ಉಳಿಸುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ',
      heardLabel: 'ಕೇಳಿಸಿದ ಮಾತು',
      stockImpact: 'ದಾಸ್ತಾನು ಬದಲಾವಣೆ',
      uncertainWarning: 'ದಯವಿಟ್ಟು ಉಳಿಸುವ ಮೊದಲು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
      transactionType: 'ಕ್ರಿಯೆಯ ಪ್ರಕಾರ',
      productName: 'ಉತ್ಪನ್ನ / ವಿವರ',
      quantity: 'ಪ್ರಮಾಣ',
      unit: 'ಘಟಕ',
      totalAmount: 'ಒಟ್ಟು ಮೊತ್ತ (₹)',
      date: 'ದಿನಾಂಕ',
      expenseCategory: 'ವರ್ಗ',
    },
    inventory: {
      title: 'ದಾಸ್ತಾನು ನಿರ್ವಹಣೆ',
      subtitle: 'ಸ್ಟಾಕ್ ಮಟ್ಟ, ಖರೀದಿ ಬೆಲೆ, ಮಾರಾಟ ಬೆಲೆ ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳನ್ನು ಗಮನಿಸಿ.',
      searchPlaceholder: 'ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ...',
      allCategories: 'ಎಲ್ಲಾ ವರ್ಗಗಳು',
      lowStockOnly: 'ಕಡಿಮೆ ಸ್ಟಾಕ್ ಮಾತ್ರ',
      product: 'ಉತ್ಪನ್ನ',
      category: 'ವರ್ಗ',
      purchasePrice: 'ಖರೀದಿ ಬೆಲೆ',
      sellingPrice: 'ಮಾರಾಟ ಬೆಲೆ',
      margin: 'ಲಾಭಾಂಶ',
      stock: 'ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್',
      minStock: 'ಕನಿಷ್ಠ ಮಟ್ಟ',
      status: 'ಸ್ಥಿತಿ',
      lowStockLabel: 'ಕಡಿಮೆ ಸ್ಟಾಕ್',
      inStockLabel: 'ಲಭ್ಯವಿದೆ',
      outOfStockLabel: 'ಸ್ಟಾಕ್ ಇಲ್ಲ',
      emptyTitle: 'ಯಾವುದೇ ಉತ್ಪನ್ನ ಕಂಡುಬಂದಿಲ್ಲ',
      emptySubtitle: 'ಹುಡುಕಾಟವನ್ನು ಬದಲಿಸಿ ಅಥವಾ ಹೊಸ ಉತ್ಪನ್ನವನ್ನು ಸೇರಿಸಿ.',
    },
    transactions: {
      title: 'ಮಾರಾಟ ಮತ್ತು ವೆಚ್ಚದ ಖಾತೆ',
      subtitle: 'ದೈನಂದಿನ ಆದಾಯ, ಖರೀದಿ ವೆಚ್ಚ, ಖರ್ಚು ಮತ್ತು ಅಂದಾಜು ಲಾಭ.',
      allTypes: 'ಎಲ್ಲಾ',
      salesOnly: 'ಮಾರಾಟ',
      expensesOnly: 'ವೆಚ್ಚ',
      today: 'ಇಂದು',
      last7Days: 'ಕಳೆದ 7 ದಿನಗಳು',
      thisMonth: 'ಈ ತಿಂಗಳು',
      allTime: 'ಎಲ್ಲಾ ಸಮಯ',
      revenue: 'ಆದಾಯ',
      cogs: 'ಸರಕು ವೆಚ್ಚ',
      expenses: 'ಖರ್ಚುಗಳು',
      netProfit: 'ಅಂದಾಜು ಲಾಭ',
      saleLabel: 'ಮಾರಾಟ',
      expenseLabel: 'ವೆಚ್ಚ',
      emptyTitle: 'ಯಾವುದೇ ವಹಿವಾಟುಗಳಿಲ್ಲ',
      emptySubtitle: 'ಹೊಸ ಮಾರಾಟ ಅಥವಾ ವೆಚ್ಚವನ್ನು ದಾಖಲಿಸಿ.',
    },
    advisor: {
      title: 'Gemini AI ವ್ಯಾಪಾರ ಸಲಹೆಗಾರ',
      subtitle: 'ನಿಮ್ಮ ನಿಜವಾದ ಮಾರಾಟ, ಲಾಭ ಮತ್ತು ಸ್ಟಾಕ್ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.',
      placeholder: 'ಇಂದಿನ ಆದಾಯ, ಹೆಚ್ಚು ಮಾರಾಟವಾದ ವಸ್ತುಗಳು ಅಥವಾ ರೀಸ್ಟಾಕ್ ಬಗ್ಗೆ ಕೇಳಿ...',
      starterLabel: 'ಪ್ರಶ್ನೆಗಳ ಉದಾಹರಣೆ',
      starters: [
        'ಇಂದು ನನಗೆ ಎಷ್ಟು ಲಾಭವಾಗಿದೆ?',
        'ಅತಿ ಹೆಚ್ಚು ಮಾರಾಟವಾದ ಉತ್ಪನ್ನಗಳು ಯಾವುವು?',
        'ಯಾವ ಉತ್ಪನ್ನಗಳನ್ನು ತಕ್ಷಣ ಸ್ಟಾಕ್ ಮಾಡಬೇಕು?',
        'ಈ ವಾರ ಎಷ್ಟು ಖರ್ಚು ಮಾಡಿದ್ದೇನೆ?',
        'ಯಾವ ಉತ್ಪನ್ನದಲ್ಲಿ ಅತಿ ಹೆಚ್ಚು ಲಾಭಾಂಶವಿದೆ?',
      ],
    },
    reports: {
      title: 'ವ್ಯಾಪಾರ ವರದಿಗಳು',
      subtitle: 'ಮಾರಾಟ, ವೆಚ್ಚ, ಪ್ರಮುಖ ಉತ್ಪನ್ನಗಳು ಮತ್ತು ಸ್ಟಾಕ್ ಸ್ಥಿತಿಯ ವಿಶ್ಲೇಷಣೆ.',
      daily: 'ದೈನಂದಿನ',
      weekly: 'ವಾರದ',
      monthly: 'ತಿಂಗಳ',
      salesTrend: 'ಆದಾಯ ಮತ್ತು ವೆಚ್ಚದ ಪ್ರವೃತ್ತಿ',
      expenseBreakdown: 'ವೆಚ್ಚದ ವಿಭಜನೆ',
      bestSelling: 'ಹೆಚ್ಚು ಮಾರಾಟವಾದ ಉತ್ಪನ್ನಗಳು',
      inventoryStatus: 'ದಾಸ್ತಾನು ಮೌಲ್ಯ ಮತ್ತು ಸ್ಥಿತಿ',
      unitsSold: 'ಮಾರಾಟವಾದ ಪ್ರಮಾಣ',
      revenueGenerated: 'ಆದಾಯ',
      grossProfit: 'ಒಟ್ಟು ಲಾಭ',
    },
    onboarding: {
      title: 'ಭಾಷಾಸಾಥಿ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ (3 ಹಂತಗಳು)',
      subtitle: 'ಸಂಕೀರ್ಣ ಸಾಫ್ಟ್‌ವೇರ್ ಇಲ್ಲದೆ ದೈನಂದಿನ ಮಾರಾಟ, ಸ್ಟಾಕ್ ಮತ್ತು ಲಾಭವನ್ನು ನಿರ್ವಹಿಸಿ.',
      dismiss: 'ಮರೆಮಾಡಿ',
      showGuide: 'ಮಾರ್ಗದರ್ಶಿ',
      step1Title: '1. ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ',
      step1Desc: 'ಕನ್ನಡ, हिंदी ಅಥವಾ English ನಲ್ಲಿ “ಇಂದು 2 ಕೆಜಿ ಅಕ್ಕಿ 120 ರೂಪಾಯಿಗೆ ಮಾರಿದೆ” ಎಂದು ಹೇಳಿ.',
      step2Title: '2. ಪರಿಶೀಲಿಸಿ ಮತ್ತು ದೃಢೀಕರಿಸಿ',
      step2Desc: 'ಉಳಿಸುವ ಮೊದಲು ಉತ್ಪನ್ನ, ಪ್ರಮಾಣ, ಮೊತ್ತ ಮತ್ತು ಸ್ಟಾಕ್ ಬದಲಾವಣೆಯನ್ನು ಖಚಿತಪಡಿಸಿ.',
      step3Title: '3. ಲಾಭ ಮತ್ತು ಸ್ಟಾಕ್ ಗಮನಿಸಿ',
      step3Desc: 'ಮಾರಾಟದ ನಂತರ ಸ್ಟಾಕ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಕಡಿಮೆಯಾಗುತ್ತದೆ ಮತ್ತು AI ಸಲಹೆ ನೀಡುತ್ತದೆ.',
      tryNow: 'ಡೆಮೊ ಪ್ರಯತ್ನಿಸಿ',
    },
  },
  hi: {
    appName: 'भाषासाथी',
    tagline: 'आपकी दुकान। आपकी भाषा। आपका AI सहायक।',
    demoBadge: 'डेमो डेटा',
    resetDemo: 'डेमो रीसेट करें',
    nav: {
      dashboard: 'डैशबोर्ड',
      assistant: 'वॉइस असिस्टेंट',
      inventory: 'इन्वेंटरी',
      transactions: 'बिक्री और खर्च',
      advisor: 'AI सलाहकार',
      reports: 'रिपोर्ट्स',
    },
    actions: {
      speakNow: 'बोलकर दर्ज करें',
      recordSale: 'बिक्री लिखें',
      recordExpense: 'खर्च लिखें',
      addProduct: 'सामान जोड़ें',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      confirmSave: 'पक्का करें और सहेजें',
      edit: 'बदलें',
      delete: 'हटाएं',
      restock: 'स्टॉक बढ़ाएं',
      send: 'भेजें',
      tryCommand: 'चलाएं',
    },
    dashboard: {
      todayRevenue: 'आज की बिक्री',
      todayExpenses: 'आज का खर्च',
      estimatedProfit: 'अनुमानित मुनाफा',
      totalTransactions: 'कुल लेन-देन',
      productsInStock: 'स्टॉक में सामान',
      lowStockAlerts: 'कम स्टॉक अलर्ट',
      weeklySalesChart: 'साप्ताहिक बिक्री और खर्च',
      recentTransactions: 'हाल के लेन-देन',
      voiceHeroTitle: 'बोलकर अपनी दुकान संभालें',
      voiceHeroSubtitle: 'हिंदी, ಕನ್ನಡ या English में बिक्री दर्ज करें या हिसाब पूछें।',
      tryDemoCommands: 'डेमो कमांड आज़माएं',
      viewAll: 'सभी देखें',
      allHealthy: 'सभी सामान पर्याप्त मात्रा में हैं।',
      profitSubtext: 'सामान की लागत और खर्च के बाद',
    },
    assistant: {
      title: 'AI वॉइस असिस्टेंट',
      subtitle: 'हिंदी, ಕನ್ನಡ या English में बोलें — सहेजने से पहले जांचें।',
      tapToSpeak: 'बोलने के लिए दबाएं',
      listening: 'सुन रहा हूँ... रोकने के लिए दबाएं',
      processing: 'आपकी बात समझी जा रही है...',
      tapToStop: 'रोकें',
      textPlaceholder: 'या यहाँ लिखें: जैसे "आज 2 किलो चावल 120 रुपये में बेचा"',
      micUnavailable: 'माइक्रोफोन उपलब्ध नहीं है। आप नीचे टाइप करके कमांड दे सकते हैं।',
      confirmationTitle: 'सहेजने से पहले जांचें',
      heardLabel: 'सुनी गई बात',
      stockImpact: 'स्टॉक पर असर',
      uncertainWarning: 'कृपया सहेजने से पहले विवरण की जांच करें।',
      transactionType: 'लेन-देन का प्रकार',
      productName: 'सामान / विवरण',
      quantity: 'मात्रा',
      unit: 'इकाई',
      totalAmount: 'कुल राशि (₹)',
      date: 'तारीख',
      expenseCategory: 'श्रेणी',
    },
    inventory: {
      title: 'इन्वेंटरी प्रबंधन',
      subtitle: 'स्टॉक, खरीद मूल्य, बिक्री मूल्य और कम स्टॉक अलर्ट देखें।',
      searchPlaceholder: 'सामान खोजें...',
      allCategories: 'सभी श्रेणियाँ',
      lowStockOnly: 'केवल कम स्टॉक',
      product: 'सामान',
      category: 'श्रेणी',
      purchasePrice: 'खरीद मूल्य',
      sellingPrice: 'बिक्री मूल्य',
      margin: 'मार्जिन',
      stock: 'उपलब्ध स्टॉक',
      minStock: 'न्यूनतम सीमा',
      status: 'स्थिति',
      lowStockLabel: 'कम स्टॉक',
      inStockLabel: 'स्टॉक में',
      outOfStockLabel: 'खत्म',
      emptyTitle: 'कोई सामान नहीं मिला',
      emptySubtitle: 'खोज बदलें या नया सामान जोड़ें।',
    },
    transactions: {
      title: 'बिक्री और खर्च खाता',
      subtitle: 'दैनिक बिक्री, सामान की लागत, खर्च और मुनाफे का सही हिसाब।',
      allTypes: 'सभी',
      salesOnly: 'बिक्री',
      expensesOnly: 'खर्च',
      today: 'आज',
      last7Days: 'पिछले 7 दिन',
      thisMonth: 'इस महीने',
      allTime: 'सभी समय',
      revenue: 'कुल बिक्री',
      cogs: 'सामान की लागत',
      expenses: 'खर्च',
      netProfit: 'अनुमानित मुनाफा',
      saleLabel: 'बिक्री',
      expenseLabel: 'खर्च',
      emptyTitle: 'इस अवधि में कोई लेन-देन नहीं',
      emptySubtitle: 'मैनुअल या वॉइस असिस्टेंट से बिक्री या खर्च जोड़ें।',
    },
    advisor: {
      title: 'Gemini AI व्यापार सलाहकार',
      subtitle: 'अपनी दुकान के असली आंकड़ों के आधार पर सवाल पूछें।',
      placeholder: 'आज की कमाई, सबसे ज्यादा बिकने वाला सामान या स्टॉक के बारे में पूछें...',
      starterLabel: 'सुझाए गए सवाल',
      starters: [
        'आज मेरी कितनी कमाई और मुनाफा हुआ?',
        'सबसे ज्यादा बिकने वाले सामान कौन से हैं?',
        'मुझे कौन सा सामान तुरंत मंगाना चाहिए?',
        'इस हफ्ते मैंने कितना खर्च किया?',
        'किस सामान पर सबसे ज्यादा मुनाफा है?',
      ],
    },
    reports: {
      title: 'व्यापार रिपोर्ट्स',
      subtitle: 'बिक्री, खर्च, शीर्ष उत्पादों और स्टॉक का पूरा विवरण।',
      daily: 'दैनिक',
      weekly: 'साप्ताहिक',
      monthly: 'मासिक',
      salesTrend: 'बिक्री बनाम खर्च रुझान',
      expenseBreakdown: 'खर्च का विवरण',
      bestSelling: 'सबसे ज्यादा बिकने वाले सामान',
      inventoryStatus: 'इन्वेंटरी मूल्य और स्थिति',
      unitsSold: 'बिकी मात्रा',
      revenueGenerated: 'बिक्री राशि',
      grossProfit: 'सकल मुनाफा',
    },
    onboarding: {
      title: 'भाषासाथी 3 आसान कदमों में कैसे काम करता है',
      subtitle: 'बिना किसी मुश्किल अकाउंटिंग सॉफ्टवेयर के रोज़ की बिक्री, स्टॉक और मुनाफा संभालें।',
      dismiss: 'गाइड छिपाएं',
      showGuide: 'गाइड देखें',
      step1Title: '1. बोलकर या लिखकर बताएं',
      step1Desc: 'हिंदी, ಕನ್ನಡ या English में बोलें — जैसे “आज 3 किलो चीनी 138 रुपये में बेची”।',
      step2Title: '2. जांचें और पक्का करें',
      step2Desc: 'सहेजने से पहले सामान, मात्रा, कीमत और स्टॉक में बदलाव को जांचें।',
      step3Title: '3. मुनाफा और स्टॉक ट्रैक करें',
      step3Desc: 'बिक्री के बाद स्टॉक अपने आप घटता है और AI सलाहकार असली आंकड़ों से जवाब देता है।',
      tryNow: 'डेमो कमांड चलाएं',
    },
  },
};

export const DEMO_COMMANDS: { label: string; lang: Language; command: string }[] = [
  { label: 'EN', lang: 'en', command: 'I sold 2 kg rice for 120 rupees.' },
  { label: 'EN', lang: 'en', command: 'Add 10 packets of Maggi to inventory.' },
  { label: 'EN', lang: 'en', command: "Show me today's sales." },
  { label: 'EN', lang: 'en', command: 'Which products are running low?' },
  { label: 'ಕನ್ನಡ', lang: 'kn', command: 'ಇಂದು 500 ರೂಪಾಯಿ ಮಾರಾಟವಾಗಿದೆ.' },
  { label: 'ಕನ್ನಡ', lang: 'kn', command: 'ಇಂದು 2 ಕೆಜಿ ಅಕ್ಕಿ 120 ರೂಪಾಯಿಗೆ ಮಾರಿದೆ.' },
  { label: 'हिंदी', lang: 'hi', command: 'आज 3 किलो चीनी 138 रुपये में बेची।' },
];
