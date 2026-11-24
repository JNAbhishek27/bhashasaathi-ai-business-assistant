# BhashaSaathi – Your Local Business Assistant

**Your Shop. Your Language. Your AI Assistant.**

BhashaSaathi is a voice-first, multilingual business management web application built for Indian shopkeepers, kirana stores, and local retailers. It enables non-technical store owners to log sales, track expenses, manage inventory, and get data-grounded business insights using natural speech or text in **English**, **ಕನ್ನಡ (Kannada)**, and **हिंदी (Hindi)**.

## Features

- **Voice-First AI Assistant**: Captures spoken audio in the browser (`MediaRecorder`) and processes it server-side via Google Gemini (`gemini-4-hydrogen`) into structured sales, expense, or inventory actions.
- **Confirm Before Saving**: Displays an editable confirmation screen showing the recognized transcript, extracted item, quantity, price, and inventory impact before committing any transaction.
- **Inventory Management**: Full CRUD, profit margin tracking, search/category filters, quick restock, automatic low-stock alerts, and automatic stock deduction on confirmed sales.
- **Sales & Expense Ledger**: Accurate separation of Revenue, Cost of Goods Sold (COGS), Operating Expenses, and Estimated Net Profit with date and type filters.
- **Gemini AI Business Advisor**: Conversational Q&A grounded strictly in pre-calculated shop analytics (`today`, `7-day`, `30-day`, `all-time`, per-item margins, and stock levels).
- **Business Reports**: Interactive daily, weekly, and monthly revenue/expense trend charts, expense breakdowns, best-selling products, and stock valuation tables.
- **Multilingual Interface**: Instant switching between English, ಕನ್ನಡ, and हिंदी.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express, `@google/genai` SDK (server-side only)
- **Persistence**: `localStorage` with preloaded demo data for *Abhi Kirana Store*

## Local Setup

1. **Prerequisites**: Node.js 22+
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**:
   Copy `.env.example` to `.env` and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```
4. **Run in development**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).
5. **Production build**:
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

## Security Notes

- `GEMINI_API_KEY` is accessed exclusively on the server (`server.ts`) and is never exposed to browser bundles.
- `.env*` files are excluded from Git via `.gitignore`. Never commit your `.env` file.
