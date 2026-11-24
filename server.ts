import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { InventoryItem, Language, Transaction, ValidationIssueCode } from './src/types.ts';
import {
  buildAdvisorContext,
  computeSummary,
  formatINR,
  getLowStockItems,
  matchInventoryProduct,
} from './src/utils/analytics.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = msg.includes('503') || msg.includes('UNAVAILABLE');
      if (!isTransient || attempt === maxRetries) {
        throw err;
      }
      const delayMs = attempt === 0 ? 700 : 1600;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

function formatApiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : 'Unexpected server error.';
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message:
        'Gemini API rate limit or daily free-tier quota reached. Please wait a moment or check your API key plan in Settings > Secrets.',
    };
  }
  if (raw.includes('503') || raw.includes('UNAVAILABLE')) {
    return {
      status: 503,
      message: 'AI service is temporarily busy. Please try again in a few seconds.',
    };
  }
  if (raw.includes('API_KEY_INVALID') || raw.includes('PERMISSION_DENIED')) {
    return {
      status: 403,
      message: 'Gemini API key is invalid or missing. Please verify GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (raw.includes('NOT_FOUND') || raw.includes('404')) {
    return {
      status: 502,
      message: 'Configured Gemini model was unavailable. Please try again.',
    };
  }
  return { status: 500, message: raw };
}

function getLanguageName(lang: string): string {
  if (lang === 'kn') return 'Kannada (ಕನ್ನಡ)';
  if (lang === 'hi') return 'Hindi (हिंदी)';
  return 'English';
}

function getUnclearSpeechMessage(lang: string): string {
  if (lang === 'kn') {
    return 'ಧ್ವನಿ ಸ್ಪಷ್ಟವಾಗಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಮಾತನಾಡಿ ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.';
  }
  if (lang === 'hi') {
    return 'आवाज़ साफ़ सुनाई नहीं दी। कृपया फिर से बोलें या नीचे लिखकर कमांड दें।';
  }
  return 'Could not hear speech clearly. Please try speaking again closer to the mic or type your command.';
}

function isUnintelligibleTranscript(text: string): boolean {
  const cleaned = text.trim().toLowerCase();
  if (!cleaned || cleaned.length < 2) return true;
  const noiseTokens = [
    '[inaudible]',
    '(inaudible)',
    '[silence]',
    '(silence)',
    '[music]',
    '[noise]',
    '...',
    'inaudible',
  ];
  return noiseTokens.includes(cleaned) || /^[\p{P}\s]+$/u.test(cleaned);
}

function buildLocalizedTodayQueryReply(
  lang: Language,
  summary: ReturnType<typeof computeSummary>
): string {
  if (lang === 'kn') {
    return `ಇಂದು ${summary.salesCount} ಮಾರಾಟಗಳಿಂದ ಒಟ್ಟು ${formatINR(summary.revenue)} ಆದಾಯವಾಗಿದೆ. ಸರಕು ವೆಚ್ಚ ${formatINR(summary.cogs)} ಮತ್ತು ಖರ್ಚು ${formatINR(summary.expenses)} ಕಳೆದ ನಂತರ ಅಂದಾಜು ಲಾಭ ${formatINR(summary.netProfit)}.`;
  }
  if (lang === 'hi') {
    return `आज ${summary.salesCount} बिक्री से कुल ${formatINR(summary.revenue)} की कमाई हुई है। सामान की लागत ${formatINR(summary.cogs)} और खर्च ${formatINR(summary.expenses)} घटाने के बाद अनुमानित मुनाफा ${formatINR(summary.netProfit)} है।`;
  }
  return `Today you recorded ${summary.salesCount} sales totaling ${formatINR(summary.revenue)} in revenue. After ${formatINR(summary.cogs)} in product cost and ${formatINR(summary.expenses)} in expenses, your estimated profit is ${formatINR(summary.netProfit)}.`;
}

function buildLocalizedLowStockReply(lang: Language, lowItems: InventoryItem[]): string {
  if (lowItems.length === 0) {
    if (lang === 'kn') return 'ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳ ಸ್ಟಾಕ್ ಸುರಕ್ಷಿತ ಮಟ್ಟದಲ್ಲಿದೆ.';
    if (lang === 'hi') return 'सभी सामान पर्याप्त स्टॉक में हैं।';
    return 'All products are currently above their minimum stock threshold.';
  }
  const names = lowItems.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
  if (lang === 'kn') {
    return `${lowItems.length} ಉತ್ಪನ್ನಗಳು ಕಡಿಮೆ ಸ್ಟಾಕ್‌ನಲ್ಲಿವೆ: ${names}.`;
  }
  if (lang === 'hi') {
    return `${lowItems.length} सामान कम स्टॉक में हैं: ${names}।`;
  }
  return `${lowItems.length} products are running low on stock: ${names}.`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', hasKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  app.post('/api/assistant/interpret', async (req, res) => {
    try {
      const {
        text,
        audioBase64,
        audioMimeType,
        language = 'en',
        todayDate,
        inventory = [],
        transactions = [],
        recentTransactions = [],
      } = req.body ?? {};

      const lang: Language = language === 'kn' || language === 'hi' ? language : 'en';
      const ai = getGeminiClient();
      const textCommand = typeof text === 'string' ? text.trim() : '';
      const hasAudio = !textCommand && typeof audioBase64 === 'string' && audioBase64.trim().length > 0;

      if (!textCommand && !hasAudio) {
        res.status(422).json({
          errorCode: 'UNCLEAR_SPEECH',
          error: getUnclearSpeechMessage(lang),
        });
        return;
      }

      const targetLang = getLanguageName(lang);
      const effectiveToday =
        typeof todayDate === 'string' && todayDate ? todayDate : new Date().toISOString().slice(0, 10);

      const safeInventory: InventoryItem[] = Array.isArray(inventory) ? inventory : [];
      const allTransactions: Transaction[] = Array.isArray(transactions) && transactions.length > 0
        ? transactions
        : Array.isArray(recentTransactions)
        ? recentTransactions
        : [];

      // Deterministic pre-computed context (app logic computes all numbers!)
      const advisorContext = buildAdvisorContext('Shop', safeInventory, allTransactions, effectiveToday);

      const inventorySummaryList = safeInventory.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        sellingPricePerUnit: item.sellingPrice,
        currentQuantity: item.quantity,
      }));

      const systemInstruction = `You are BhashaSaathi, an AI command parser for an Indian kirana / local retail shopkeeper.
Parse the shopkeeper's spoken or typed command into structured JSON fields.
The shopkeeper may speak in English, Kannada (ಕನ್ನಡ), Hindi (हिंदी), or mixed local phrasing.

Common Kannada shop terms:
- ಅಕ್ಕಿ (akki) = Rice, ಗೋಧಿ (godhi) = Wheat, ಸಕ್ಕರೆ (sakkare) = Sugar, ಮ್ಯಾಗಿ = Maggi, ಹಾಲು (haalu) = Milk, ಎಣ್ಣೆ / ಅಡುಗೆ ಎಣ್ಣೆ = Cooking Oil, ತೊಗರಿ ಬೇಳೆ = Toor Dal, ಚಹಾ ಪುಡಿ = Tea Powder
- ಮಾರಿದೆ / ಮಾರಾಟವಾಗಿದೆ = sold / sale
- ಖರ್ಚು / ವೆಚ್ಚ = expense
- ಸೇರಿಸಿ / ಸ್ಟಾಕ್ ಸೇರಿಸಿ = add inventory / restock
- ಇಂದು = today (${effectiveToday})
- ಕೆಜಿ = kg, ಲೀಟರ್ = litres, ಪ್ಯಾಕೆಟ್ = packets, ರೂಪಾಯಿ = rupees

Common Hindi shop terms:
- चावल = Rice, गेहूँ / आटा = Wheat, चीनी = Sugar, मैगी = Maggi, दूध = Milk, तेल = Cooking Oil, दाल = Toor Dal, चाय = Tea Powder
- बेचा / बिक्री = sold / sale
- खर्च = expense
- जोड़ो / स्टॉक बढ़ाओ = add inventory / restock
- आज = today (${effectiveToday})
- किलो = kg, लीटर = litres, पैकेट = packets, रुपये = rupees

CRITICAL EXTRACTION RULES:
1. Do NOT perform arithmetic or invent prices. Only extract "explicitTotalPrice" if the user explicitly stated a total rupee amount, and "unitPriceMentioned" if they stated a per-unit price. Leave them null if not stated (application code will calculate prices from catalog).
2. Match products against the provided inventory list whenever possible and return matchedProductId and exact productName/unit.
3. If the user states a total counter sale without naming a product (e.g. "ಇಂದು 500 ರೂಪಾಯಿ ಮಾರಾಟವಾಗಿದೆ" -> "Today 500 rupees sales happened"), set intent="record_sale", isGeneralCounterSale=true, productName="General Counter Sale", matchedProductId=null, quantity=1, unit="lot", explicitTotalPrice=500.
4. If the user says a sale/restock without naming a product AND without making it a general counter sale (e.g. "I sold 2 kg for 100 rupees"), set isGeneralCounterSale=false, productName="", matchedProductId=null, confidence="low", and ask which product in clarificationQuestion.
5. If a quantity is missing, zero, or negative in a product sale or inventory command, extract it accurately (or null) and set confidence="low" with a helpful clarificationQuestion in ${targetLang}.
6. For query_general questions, answer strictly using the pre-computed summaries and inventory provided in the JSON payload. Never invent numbers.
7. Write replyMessage and clarificationQuestion in ${targetLang} using simple, warm shopkeeper-friendly wording.`;

      const promptPayload = JSON.stringify({
        todayDate: effectiveToday,
        userCommand: hasAudio
          ? '[Listen to the attached audio clip, transcribe it accurately into the "transcript" field, and extract the command. If no intelligible speech is heard in the audio, set transcript to "[inaudible]" and intent to "unclear".]'
          : textCommand,
        inventory: inventorySummaryList,
        precomputedShopStats: {
          dataCoverage: advisorContext.dataCoverage,
          summaries: advisorContext.summaries,
          lowStockItems: advisorContext.lowStockItems,
          inventoryWithMargins: advisorContext.inventoryWithMargins,
          bestSellingLast7Days: advisorContext.bestSellingLast7Days,
          bestSellingAllTime: advisorContext.bestSellingAllTime,
          expenseBreakdownLast7Days: advisorContext.expenseBreakdownLast7Days,
          expenseBreakdownAllTime: advisorContext.expenseBreakdownAllTime,
        },
      });

      const contentsPayload = hasAudio
        ? {
            parts: [
              {
                inlineData: {
                  mimeType:
                    typeof audioMimeType === 'string' && audioMimeType
                      ? audioMimeType
                      : 'audio/webm',
                  data: audioBase64,
                },
              },
              {
                text: `Listen carefully to this spoken shopkeeper command in English, Kannada, Hindi, or mixed Kanglish/Hinglish. Transcribe it accurately into "transcript" (or "[inaudible]" if silent/unintelligible), and extract the structured JSON using this shop context:\n${promptPayload}`,
              },
            ],
          }
        : promptPayload;

      const interpretResponse = await withRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: contentsPayload,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                transcript: {
                  type: Type.STRING,
                  description: 'Exact verbatim transcription of the spoken audio or the input command text. Return "[inaudible]" if audio has no intelligible speech.',
                },
                intent: {
                  type: Type.STRING,
                  enum: [
                    'record_sale',
                    'record_expense',
                    'add_inventory',
                    'query_today_sales',
                    'query_low_stock',
                    'query_general',
                    'unclear',
                  ],
                  description: 'Classified shopkeeper intent.',
                },
                productName: {
                  type: Type.STRING,
                  description: 'Matched product name, expense description, or empty string if missing.',
                },
                matchedProductId: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'Matching inventory item id, or null if unmatched.',
                },
                isGeneralCounterSale: {
                  type: Type.BOOLEAN,
                  description: 'True only when user records a general lump-sum daily/counter sale without a specific item.',
                },
                quantity: {
                  type: Type.NUMBER,
                  nullable: true,
                  description: 'Extracted numeric quantity, or null if not stated.',
                },
                unit: {
                  type: Type.STRING,
                  description: 'Unit such as kg, packets, litres, pieces, or lot.',
                },
                explicitTotalPrice: {
                  type: Type.NUMBER,
                  nullable: true,
                  description: 'Total rupee amount ONLY if explicitly stated by user; otherwise null.',
                },
                unitPriceMentioned: {
                  type: Type.NUMBER,
                  nullable: true,
                  description: 'Per-unit rupee price ONLY if explicitly stated by user; otherwise null.',
                },
                expenseCategory: {
                  type: Type.STRING,
                  description: 'Category such as Grains & Staples, Transport, Utilities, Packaging, Rent, Stock Purchase, or General.',
                },
                date: {
                  type: Type.STRING,
                  description: 'ISO date YYYY-MM-DD, defaulting to todayDate.',
                },
                confidence: {
                  type: Type.STRING,
                  enum: ['high', 'medium', 'low'],
                  description: 'Extraction confidence.',
                },
                replyMessage: {
                  type: Type.STRING,
                  description: 'Clear response in the chosen language.',
                },
                clarificationQuestion: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'Clarification prompt if any detail is missing or uncertain, else null.',
                },
              },
              required: [
                'transcript',
                'intent',
                'productName',
                'isGeneralCounterSale',
                'unit',
                'expenseCategory',
                'date',
                'confidence',
                'replyMessage',
              ],
            },
          },
        })
      );

      const rawJson = (interpretResponse.text ?? '{}').trim();
      const parsed = JSON.parse(rawJson);
      const transcript = (hasAudio ? parsed.transcript || '' : textCommand).trim();

      if (isUnintelligibleTranscript(transcript)) {
        res.status(422).json({
          errorCode: 'UNCLEAR_SPEECH',
          error: getUnclearSpeechMessage(lang),
        });
        return;
      }

      // 2. Deterministic Application Validation & Price Calculation
      const intent = parsed.intent || 'unclear';
      const isMutation =
        intent === 'record_sale' || intent === 'record_expense' || intent === 'add_inventory';

      const matchedProduct =
        intent === 'record_sale' || intent === 'add_inventory'
          ? matchInventoryProduct(parsed.productName, parsed.matchedProductId, safeInventory)
          : null;

      const resolvedProductName = matchedProduct
        ? matchedProduct.name
        : (parsed.productName || '').trim();
      const resolvedProductId = matchedProduct ? matchedProduct.id : null;
      const resolvedUnit = matchedProduct
        ? matchedProduct.unit
        : (parsed.unit || 'units').trim();

      const rawQty = typeof parsed.quantity === 'number' && Number.isFinite(parsed.quantity)
        ? parsed.quantity
        : null;
      const isGeneralCounterSale = Boolean(parsed.isGeneralCounterSale);

      const explicitTotal =
        typeof parsed.explicitTotalPrice === 'number' && Number.isFinite(parsed.explicitTotalPrice)
          ? parsed.explicitTotalPrice
          : null;
      const unitPrice =
        typeof parsed.unitPriceMentioned === 'number' && Number.isFinite(parsed.unitPriceMentioned)
          ? parsed.unitPriceMentioned
          : null;

      let computedTotalPrice: number | null = explicitTotal;
      let priceCalculatedByApp = false;

      if ((computedTotalPrice === null || computedTotalPrice <= 0) && rawQty !== null && rawQty > 0) {
        if (unitPrice !== null && unitPrice > 0) {
          computedTotalPrice = Math.round(unitPrice * rawQty * 100) / 100;
          priceCalculatedByApp = true;
        } else if (intent === 'record_sale' && matchedProduct && matchedProduct.sellingPrice > 0) {
          computedTotalPrice = Math.round(matchedProduct.sellingPrice * rawQty * 100) / 100;
          priceCalculatedByApp = true;
        }
      }

      const validationIssues: ValidationIssueCode[] = [];
      let confidence: 'high' | 'medium' | 'low' = parsed.confidence || 'medium';
      let clarificationQuestion: string | null = parsed.clarificationQuestion ?? null;

      if (intent === 'unclear') {
        validationIssues.push('UNCLEAR_INTENT');
        confidence = 'low';
      }

      if (intent === 'record_sale' || intent === 'add_inventory') {
        const missingName =
          !isGeneralCounterSale &&
          (!resolvedProductName ||
            resolvedProductName.length < 2 ||
            ['unknown', 'item', 'product', 'something'].includes(resolvedProductName.toLowerCase()));

        if (missingName) {
          validationIssues.push('MISSING_PRODUCT');
          confidence = 'low';
        }

        if (!isGeneralCounterSale && (rawQty === null || rawQty <= 0)) {
          validationIssues.push('INVALID_QUANTITY');
          confidence = 'low';
        }
      }

      if (intent === 'record_expense') {
        if (!resolvedProductName || resolvedProductName.length < 2) {
          validationIssues.push('MISSING_PRODUCT');
          confidence = 'low';
        }
        if (computedTotalPrice === null || computedTotalPrice <= 0) {
          validationIssues.push('INVALID_AMOUNT');
          confidence = 'low';
        }
      }

      if (intent === 'record_sale' && (computedTotalPrice === null || computedTotalPrice <= 0)) {
        validationIssues.push('INVALID_AMOUNT');
        confidence = 'low';
      }

      if (
        intent === 'record_sale' &&
        matchedProduct &&
        rawQty !== null &&
        rawQty > matchedProduct.quantity
      ) {
        validationIssues.push('INSUFFICIENT_STOCK');
        confidence = 'low';
      }

      let replyMessage: string = parsed.replyMessage || '';

      // Override query responses with 100% app-computed numbers so AI never miscalculates
      if (intent === 'query_today_sales') {
        replyMessage = buildLocalizedTodayQueryReply(lang, advisorContext.summaries.today);
      } else if (intent === 'query_low_stock') {
        replyMessage = buildLocalizedLowStockReply(lang, getLowStockItems(safeInventory));
      }

      if (validationIssues.length > 0 && !clarificationQuestion) {
        if (lang === 'kn') {
          clarificationQuestion = 'ದಯವಿಟ್ಟು ಉತ್ಪನ್ನ, ಪ್ರಮಾಣ ಮತ್ತು ಮೊತ್ತವನ್ನು ಪರಿಶೀಲಿಸಿ.';
        } else if (lang === 'hi') {
          clarificationQuestion = 'कृपया सामान का नाम, मात्रा और राशि की जांच करें।';
        } else {
          clarificationQuestion = 'Please check the product name, quantity, and amount before saving.';
        }
      }

      res.json({
        transcript,
        action: {
          intent,
          productName: resolvedProductName,
          matchedProductId: resolvedProductId,
          quantity: isGeneralCounterSale && rawQty === null ? 1 : rawQty,
          unit: isGeneralCounterSale && !resolvedProductId ? 'lot' : resolvedUnit,
          totalPrice: computedTotalPrice,
          priceCalculatedByApp,
          isGeneralCounterSale,
          expenseCategory: matchedProduct?.category || parsed.expenseCategory || 'General',
          date: parsed.date || effectiveToday,
          confidence,
          needsConfirmation: isMutation || intent === 'unclear',
          replyMessage,
          clarificationQuestion,
          validationIssues,
        },
      });
    } catch (error) {
      console.error('Error in /api/assistant/interpret:', error);
      const { status, message } = formatApiError(error);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/assistant/advise', async (req, res) => {
    try {
      const {
        question,
        history = [],
        language = 'en',
        shopName = 'Abhi Kirana Store',
        todayDate,
        inventory = [],
        transactions = [],
        shopState,
      } = req.body ?? {};

      if (!question || typeof question !== 'string') {
        res.status(400).json({ error: 'Please enter a business question.' });
        return;
      }

      const lang: Language = language === 'kn' || language === 'hi' ? language : 'en';
      const ai = getGeminiClient();
      const targetLang = getLanguageName(lang);

      const effectiveToday =
        typeof todayDate === 'string' && todayDate
          ? todayDate
          : shopState?.todayDate || new Date().toISOString().slice(0, 10);

      const safeInventory: InventoryItem[] = Array.isArray(inventory) && inventory.length > 0
        ? inventory
        : Array.isArray(shopState?.inventory)
        ? shopState.inventory
        : [];
      const safeTransactions: Transaction[] = Array.isArray(transactions) && transactions.length > 0
        ? transactions
        : Array.isArray(shopState?.transactions)
        ? shopState.transactions
        : [];

      // Always compute exact metrics on the server via application logic
      const deterministicContext = buildAdvisorContext(
        shopState?.shopName || shopName,
        safeInventory,
        safeTransactions,
        effectiveToday
      );

      const systemInstruction = `You are BhashaSaathi Business Advisor for "${deterministicContext.shopName}".
All financial totals, profits, margins, best-sellers, and stock statuses in the JSON context below have already been calculated accurately by the application.

STRICT RULES:
1. Quote ONLY numbers that appear in the provided JSON context. Never guess, extrapolate, or perform unverified mental arithmetic.
2. Clearly distinguish Revenue, Cost of Goods Sold (COGS), Operating Expenses, Gross Profit, and Net Profit (Revenue - COGS - Expenses). Never call revenue "profit".
3. Check "dataCoverage" (earliestDate, latestDate, totalTransactions). If the shopkeeper asks about a product, expense, or date range with no matching records in the provided data, explicitly say that data is not available/insufficient in ${targetLang}.
4. Keep answers concise, practical, in plain readable text without markdown bold asterisks (**), and use ₹ for Indian Rupees.
5. Respond exclusively in ${targetLang}.`;

      const formattedHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .map((m: { role?: string; content?: string }) => `${m.role === 'user' ? 'Shopkeeper' : 'Advisor'}: ${m.content || ''}`)
            .join('\n')
        : '';

      const contents = `VERIFIED SHOP ANALYTICS CONTEXT (COMPUTED BY APPLICATION):
${JSON.stringify(deterministicContext)}

RECENT CONVERSATION:
${formattedHistory || 'None'}

SHOPKEEPER QUESTION:
${question}`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          },
        })
      );

      const answer = (response.text ?? '').trim();
      if (!answer) {
        throw new Error('Gemini returned an empty response. Please try again.');
      }

      res.json({ answer });
    } catch (error) {
      console.error('Error in /api/assistant/advise:', error);
      const { status, message } = formatApiError(error);
      res.status(status).json({ error: message });
    }
  });

  const distDir = path.resolve(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distDir);

  if (isProd) {
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BhashaSaathi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
