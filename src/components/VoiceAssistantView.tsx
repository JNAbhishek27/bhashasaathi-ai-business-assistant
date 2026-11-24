import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  Send,
  Square,
} from 'lucide-react';
import { DEMO_COMMANDS, type TranslationStrings } from '../i18n/translations';
import type {
  InterpretResponse,
  InterpretedAction,
  InventoryItem,
  Language,
  Transaction,
  ValidationIssueCode,
} from '../types';
import type { FinancialSummary } from '../utils/analytics';
import { formatINR, getLowStockItems } from '../utils/analytics';

interface VoiceAssistantViewProps {
  t: TranslationStrings;
  language: Language;
  todayDate: string;
  inventory: InventoryItem[];
  transactions: Transaction[];
  todaySummary: FinancialSummary;
  queuedCommand: string | null;
  onClearQueuedCommand: () => void;
  onConfirmSale: (data: {
    productId: string | null;
    productName: string;
    quantity: number;
    unit: string;
    totalAmount: number;
    date: string;
    source: 'voice';
  }) => void;
  onConfirmExpense: (data: {
    description: string;
    amount: number;
    category: string;
    date: string;
    source: 'voice';
  }) => void;
  onConfirmRestock: (productId: string | null, productName: string, quantity: number, unit: string) => void;
}

function getClientValidationIssues(
  action: InterpretedAction,
  inventory: InventoryItem[]
): ValidationIssueCode[] {
  const issues: ValidationIssueCode[] = [];

  if (action.intent === 'unclear') {
    issues.push('UNCLEAR_INTENT');
    return issues;
  }

  const trimmedName = action.productName.trim();
  const matched = action.matchedProductId
    ? inventory.find((i) => i.id === action.matchedProductId)
    : inventory.find((i) => i.name.trim().toLowerCase() === trimmedName.toLowerCase());

  if (action.intent === 'record_sale' || action.intent === 'add_inventory') {
    if (!action.isGeneralCounterSale && (!trimmedName || trimmedName.length < 2)) {
      issues.push('MISSING_PRODUCT');
    }
    if (!action.isGeneralCounterSale && (!action.quantity || !Number.isFinite(action.quantity) || action.quantity <= 0)) {
      issues.push('INVALID_QUANTITY');
    }
  }

  if (action.intent === 'record_expense' && (!trimmedName || trimmedName.length < 2)) {
    issues.push('MISSING_PRODUCT');
  }

  if (
    (action.intent === 'record_sale' || action.intent === 'record_expense') &&
    (!action.totalPrice || !Number.isFinite(action.totalPrice) || action.totalPrice <= 0)
  ) {
    issues.push('INVALID_AMOUNT');
  }

  if (
    action.intent === 'record_sale' &&
    matched &&
    action.quantity &&
    action.quantity > matched.quantity
  ) {
    issues.push('INSUFFICIENT_STOCK');
  }

  return issues;
}

export function VoiceAssistantView({
  t,
  language,
  todayDate,
  inventory,
  transactions,
  todaySummary,
  queuedCommand,
  onClearQueuedCommand,
  onConfirmSale,
  onConfirmExpense,
  onConfirmRestock,
}: VoiceAssistantViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<InterpretResponse | null>(null);
  const [draftAction, setDraftAction] = useState<InterpretedAction | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);

  const cleanupRecording = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => {
    return () => cleanupRecording();
  }, [cleanupRecording]);

  const submitToGemini = useCallback(
    async (payload: { text?: string; audioBase64?: string; audioMimeType?: string }) => {
      setIsProcessing(true);
      setApiError(null);
      setSavedNotice(null);

      try {
        const response = await fetch('/api/assistant/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            language,
            todayDate,
            inventory,
            transactions,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Could not interpret command.');
        }

        const interpreted = data as InterpretResponse;
        setResult(interpreted);

        if (interpreted.action.needsConfirmation || interpreted.action.intent === 'unclear') {
          setDraftAction({
            ...interpreted.action,
            date: interpreted.action.date || todayDate,
          });
        } else {
          setDraftAction(null);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to process voice command.';
        setApiError(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [inventory, language, todayDate, transactions]
  );

  // Run command queued from Dashboard "Try Demo Commands"
  useEffect(() => {
    if (queuedCommand) {
      setTextInput(queuedCommand);
      void submitToGemini({ text: queuedCommand });
      onClearQueuedCommand();
    }
  }, [queuedCommand, onClearQueuedCommand, submitToGemini]);

  const startRecording = async () => {
    setMicError(null);
    setApiError(null);
    setSavedNotice(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError(t.assistant.micUnavailable);
      textInputRef.current?.focus();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
      ];
      const supportedMimeType =
        preferredTypes.find(
          (type) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)
        ) || '';

      const recorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        cleanupRecording();
        setIsRecording(false);
        setRecordingSeconds(0);

        if (blob.size < 400) {
          setMicError('Recording was too short or silent. Please try speaking again or type your command.');
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(',')[1];
          if (base64) {
            void submitToGemini({ audioBase64: base64, audioMimeType: mime.split(';')[0] });
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      cleanupRecording();
      setIsRecording(false);
      setMicError(t.assistant.micUnavailable);
      textInputRef.current?.focus();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      cleanupRecording();
      setIsRecording(false);
    }
  };

  const handleTextSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = textInput.trim();
    if (!cleaned || isProcessing) return;
    void submitToGemini({ text: cleaned });
  };

  const draftIssues = draftAction ? getClientValidationIssues(draftAction, inventory) : [];
  const blockingIssues = draftIssues.filter((code) => code !== 'INSUFFICIENT_STOCK');

  const handleConfirmAction = () => {
    if (!draftAction) return;

    if (blockingIssues.length > 0) {
      setApiError('Please fix the highlighted fields (action type, product name, quantity, or amount) before saving.');
      return;
    }

    setApiError(null);

    if (draftAction.intent === 'record_sale') {
      const qty = Number(draftAction.quantity) || 1;
      const amt = Number(draftAction.totalPrice) || 0;
      onConfirmSale({
        productId: draftAction.matchedProductId,
        productName: draftAction.productName.trim() || 'General Counter Sale',
        quantity: qty,
        unit: draftAction.unit || 'units',
        totalAmount: amt,
        date: draftAction.date || todayDate,
        source: 'voice',
      });
      setSavedNotice(`Saved sale: ${draftAction.productName} (${qty} ${draftAction.unit}) for ${formatINR(amt)}.`);
    } else if (draftAction.intent === 'record_expense') {
      const amt = Number(draftAction.totalPrice) || 0;
      onConfirmExpense({
        description: draftAction.productName.trim(),
        amount: amt,
        category: draftAction.expenseCategory || 'General',
        date: draftAction.date || todayDate,
        source: 'voice',
      });
      setSavedNotice(`Saved expense: ${draftAction.productName} (${formatINR(amt)}).`);
    } else if (draftAction.intent === 'add_inventory') {
      const qty = Number(draftAction.quantity) || 0;
      onConfirmRestock(
        draftAction.matchedProductId,
        draftAction.productName.trim(),
        qty,
        draftAction.unit || 'units'
      );
      setSavedNotice(`Added ${qty} ${draftAction.unit} of ${draftAction.productName} to inventory.`);
    } else {
      return;
    }

    setDraftAction(null);
    setResult(null);
    setTextInput('');
  };

  const matchedInventoryItem = draftAction?.matchedProductId
    ? inventory.find((i) => i.id === draftAction.matchedProductId)
    : inventory.find(
        (i) => i.name.toLowerCase() === (draftAction?.productName || '').trim().toLowerCase()
      );

  const lowStockList = getLowStockItems(inventory);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Main Mic & Input Card */}
      <section className="rounded-xl bg-white border border-[#E6E4DC] p-6 sm:p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-[#141B16]">{t.assistant.title}</h2>
        <p className="mt-1.5 text-sm text-[#525B54]">{t.assistant.subtitle}</p>

        {/* Prominent Microphone Button */}
        <div className="my-7 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <motion.span
                aria-hidden="true"
                initial={{ scale: 1, opacity: 0.45 }}
                animate={{ scale: 1.45, opacity: 0 }}
                transition={{ duration: 1.3, repeat: Infinity, ease: 'easeOut' }}
                className="absolute w-24 h-24 rounded-full bg-[#DC2626]"
              />
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              disabled={isProcessing}
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14532D]/30 ${
                isRecording
                  ? 'bg-[#DC2626] text-white'
                  : isProcessing
                  ? 'bg-[#F3F2EC] text-[#525B54] cursor-wait'
                  : 'bg-[#14532D] hover:bg-[#166534] text-white shadow-md'
              }`}
              aria-label={isRecording ? t.assistant.tapToStop : t.assistant.tapToSpeak}
            >
              {isProcessing ? (
                <Loader2 className="w-9 h-9 animate-spin" />
              ) : isRecording ? (
                <Square className="w-8 h-8 fill-current" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </motion.button>
          </div>

          <div className="mt-3.5 text-sm font-medium text-[#141B16]">
            {isProcessing ? (
              <span>{t.assistant.processing}</span>
            ) : isRecording ? (
              <span className="text-[#DC2626] inline-flex items-center gap-2 font-mono-num">
                <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                {t.assistant.listening} (0:{String(recordingSeconds).padStart(2, '0')})
              </span>
            ) : (
              <span>{t.assistant.tapToSpeak}</span>
            )}
          </div>
          <div className="mt-1 text-xs text-[#525B54]">English · ಕನ್ನಡ · हिंदी</div>
        </div>

        {/* Mic Permission / Fallback Notice */}
        {micError && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 text-left">
            <MicOff className="w-4 h-4 shrink-0 text-[#D97706]" />
            <span>{micError}</span>
          </div>
        )}

        {/* Text Input Fallback */}
        <form onSubmit={handleTextSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-2xl mx-auto">
          <input
            ref={textInputRef}
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={t.assistant.textPlaceholder}
            disabled={isProcessing}
            className="flex-1 h-12 px-4 rounded-xl border border-[#E6E4DC] bg-[#FAF9F5] text-sm text-[#141B16] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D]"
          />
          <button
            type="submit"
            disabled={isProcessing || !textInput.trim()}
            className="h-12 px-5 rounded-xl bg-[#14532D] hover:bg-[#166534] disabled:opacity-50 text-white text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{t.actions.send}</span>
          </button>
        </form>
      </section>

      {/* Error Message */}
      {apiError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626] mt-0.5" />
          <div>{apiError}</div>
        </div>
      )}

      {/* Saved Confirmation Toast */}
      {savedNotice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-sm text-[#14532D] font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Structured Confirmation Screen (Required Before Any Transaction) */}
      {draftAction && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl bg-white border border-[#14532D]/40 p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E6E4DC]">
            <div>
              <h3 className="text-lg font-semibold text-[#141B16]">
                {t.assistant.confirmationTitle}
              </h3>
              {result?.transcript && (
                <p className="text-xs text-[#525B54] mt-1">
                  {t.assistant.heardLabel}: <span className="font-medium text-[#141B16]">“{result.transcript}”</span>
                </p>
              )}
            </div>
            <div className="text-xs font-medium text-[#525B54]">
              Confidence: <span className="text-[#141B16] capitalize">{draftAction.confidence}</span>
            </div>
          </div>

          {draftAction.replyMessage && (
            <div className="px-4 py-3 rounded-lg bg-[#F3F2EC] text-sm text-[#141B16]">
              {draftAction.replyMessage}
            </div>
          )}

          {(draftAction.confidence === 'low' ||
            draftAction.clarificationQuestion ||
            draftIssues.length > 0) && (
            <div className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold">{t.assistant.uncertainWarning}</div>
                {draftAction.clarificationQuestion && (
                  <div>{draftAction.clarificationQuestion}</div>
                )}
                {draftIssues.includes('MISSING_PRODUCT') && (
                  <div>Missing product/item name — select a product from inventory or type an item name.</div>
                )}
                {draftIssues.includes('INVALID_QUANTITY') && (
                  <div>Quantity must be greater than 0.</div>
                )}
                {draftIssues.includes('INVALID_AMOUNT') && (
                  <div>Total amount (₹) must be greater than 0.</div>
                )}
                {draftIssues.includes('INSUFFICIENT_STOCK') && matchedInventoryItem && (
                  <div>
                    Warning: Only {matchedInventoryItem.quantity} {matchedInventoryItem.unit} of{' '}
                    {matchedInventoryItem.name} available in stock.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">
                {t.assistant.transactionType}
              </label>
              <select
                value={draftAction.intent}
                onChange={(e) => {
                  const nextIntent = e.target.value as InterpretedAction['intent'];
                  setDraftAction({
                    ...draftAction,
                    intent: nextIntent,
                    matchedProductId: nextIntent === 'record_expense' ? null : draftAction.matchedProductId,
                    isGeneralCounterSale: nextIntent === 'record_sale' ? draftAction.isGeneralCounterSale : false,
                    needsConfirmation: true,
                  });
                }}
                className={`w-full h-11 px-3 rounded-lg border bg-white text-sm ${
                  draftIssues.includes('UNCLEAR_INTENT')
                    ? 'border-[#D97706] ring-1 ring-[#D97706]'
                    : 'border-[#E6E4DC]'
                }`}
              >
                {draftAction.intent === 'unclear' && (
                  <option value="unclear">-- Select Action Type --</option>
                )}
                <option value="record_sale">Record Sale</option>
                <option value="record_expense">Record Expense</option>
                <option value="add_inventory">Add Stock to Inventory</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">
                {t.assistant.productName}
              </label>
              {draftAction.intent !== 'record_expense' ? (
                <select
                  value={draftAction.matchedProductId || 'custom'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setDraftAction({
                        ...draftAction,
                        matchedProductId: null,
                        isGeneralCounterSale: false,
                      });
                    } else {
                      const prod = inventory.find((i) => i.id === val);
                      if (prod) {
                        const qty = Number(draftAction.quantity) || 1;
                        setDraftAction({
                          ...draftAction,
                          matchedProductId: prod.id,
                          productName: prod.name,
                          unit: prod.unit,
                          isGeneralCounterSale: false,
                          totalPrice: Math.round(prod.sellingPrice * qty * 100) / 100,
                          priceCalculatedByApp: true,
                        });
                      }
                    }
                  }}
                  className={`w-full h-11 px-3 rounded-lg border bg-white text-sm ${
                    draftIssues.includes('MISSING_PRODUCT')
                      ? 'border-[#D97706] ring-1 ring-[#D97706]'
                      : 'border-[#E6E4DC]'
                  }`}
                >
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit} · ₹{item.sellingPrice}/{item.unit})
                    </option>
                  ))}
                  <option value="custom">
                    {draftAction.productName
                      ? `Custom / Unlisted (${draftAction.productName})`
                      : 'Custom / Select or Enter Item Name'}
                  </option>
                </select>
              ) : (
                <input
                  type="text"
                  value={draftAction.productName}
                  onChange={(e) => setDraftAction({ ...draftAction, productName: e.target.value })}
                  placeholder="e.g. Shop Electricity Bill"
                  className={`w-full h-11 px-3 rounded-lg border text-sm ${
                    draftIssues.includes('MISSING_PRODUCT')
                      ? 'border-[#D97706] ring-1 ring-[#D97706]'
                      : 'border-[#E6E4DC]'
                  }`}
                />
              )}
            </div>

            {!draftAction.matchedProductId && draftAction.intent !== 'record_expense' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#525B54] mb-1.5">
                  Item Name
                </label>
                <input
                  type="text"
                  value={draftAction.productName}
                  onChange={(e) => setDraftAction({ ...draftAction, productName: e.target.value })}
                  placeholder="Enter product name (e.g. Rice, Sugar, Maggi)"
                  className={`w-full h-11 px-3 rounded-lg border text-sm ${
                    draftIssues.includes('MISSING_PRODUCT')
                      ? 'border-[#D97706] ring-1 ring-[#D97706]'
                      : 'border-[#E6E4DC]'
                  }`}
                />
              </div>
            )}

            {draftAction.intent !== 'record_expense' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#525B54] mb-1.5">
                    {t.assistant.quantity}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={draftAction.quantity ?? ''}
                    onChange={(e) => {
                      const nextQty = e.target.value === '' ? null : Number(e.target.value);
                      const shouldRecalc =
                        draftAction.intent === 'record_sale' &&
                        matchedInventoryItem &&
                        draftAction.priceCalculatedByApp &&
                        nextQty &&
                        nextQty > 0;
                      setDraftAction({
                        ...draftAction,
                        quantity: nextQty,
                        totalPrice: shouldRecalc
                          ? Math.round(matchedInventoryItem.sellingPrice * nextQty * 100) / 100
                          : draftAction.totalPrice,
                      });
                    }}
                    className={`w-full h-11 px-3 rounded-lg border text-sm font-mono-num ${
                      draftIssues.includes('INVALID_QUANTITY')
                        ? 'border-[#D97706] ring-1 ring-[#D97706]'
                        : 'border-[#E6E4DC]'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#525B54] mb-1.5">
                    {t.assistant.unit}
                  </label>
                  <input
                    type="text"
                    value={draftAction.unit}
                    onChange={(e) => setDraftAction({ ...draftAction, unit: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm"
                  />
                </div>
              </>
            )}

            {draftAction.intent !== 'add_inventory' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#525B54]">
                    {t.assistant.totalAmount}
                  </label>
                  {draftAction.intent === 'record_sale' &&
                    matchedInventoryItem &&
                    draftAction.quantity &&
                    draftAction.quantity > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setDraftAction({
                            ...draftAction,
                            totalPrice:
                              Math.round(
                                matchedInventoryItem.sellingPrice * (draftAction.quantity || 1) * 100
                              ) / 100,
                            priceCalculatedByApp: true,
                          })
                        }
                        className="text-[11px] font-medium text-[#14532D] hover:underline cursor-pointer"
                      >
                        Use catalog ₹
                        {Math.round(
                          matchedInventoryItem.sellingPrice * (draftAction.quantity || 1)
                        )}
                      </button>
                    )}
                </div>
                <input
                  type="number"
                  min="1"
                  value={draftAction.totalPrice ?? ''}
                  onChange={(e) =>
                    setDraftAction({
                      ...draftAction,
                      totalPrice: e.target.value === '' ? null : Number(e.target.value),
                      priceCalculatedByApp: false,
                    })
                  }
                  className={`w-full h-11 px-3 rounded-lg border text-sm font-mono-num ${
                    draftIssues.includes('INVALID_AMOUNT')
                      ? 'border-[#D97706] ring-1 ring-[#D97706]'
                      : 'border-[#E6E4DC]'
                  }`}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#525B54] mb-1.5">
                {t.assistant.date}
              </label>
              <input
                type="date"
                value={draftAction.date}
                onChange={(e) => setDraftAction({ ...draftAction, date: e.target.value })}
                className="w-full h-11 px-3 rounded-lg border border-[#E6E4DC] text-sm"
              />
            </div>
          </div>

          {/* App-Calculated Inventory & Margin Preview */}
          {matchedInventoryItem && (draftAction.intent === 'record_sale' || draftAction.intent === 'add_inventory') && (
            <div className="px-4 py-3 rounded-lg bg-[#FAF9F5] border border-[#E6E4DC] text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#525B54]">{t.assistant.stockImpact}</span>
              <div className="flex flex-wrap items-center gap-4 font-mono-num font-semibold text-[#141B16]">
                <span>
                  {matchedInventoryItem.name}: {matchedInventoryItem.quantity} {matchedInventoryItem.unit} →{' '}
                  {draftAction.intent === 'record_sale'
                    ? Math.max(0, Math.round((matchedInventoryItem.quantity - (draftAction.quantity || 0)) * 100) / 100)
                    : Math.round((matchedInventoryItem.quantity + (draftAction.quantity || 0)) * 100) / 100}{' '}
                  {matchedInventoryItem.unit}
                </span>
                {draftAction.intent === 'record_sale' && draftAction.totalPrice && draftAction.quantity && (
                  <span className="text-[#14532D]">
                    Gross Margin:{' '}
                    {formatINR(
                      draftAction.totalPrice - matchedInventoryItem.purchasePrice * draftAction.quantity
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setDraftAction(null);
                setResult(null);
                setApiError(null);
              }}
              className="h-11 px-4 rounded-lg border border-[#E6E4DC] text-sm font-medium text-[#525B54] hover:bg-[#F3F2EC] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.actions.cancel}
            </button>
            <button
              type="button"
              disabled={blockingIssues.length > 0}
              onClick={handleConfirmAction}
              className="h-11 px-5 rounded-lg bg-[#14532D] hover:bg-[#166534] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.actions.confirmSave}
            </button>
          </div>
        </motion.section>
      )}

      {/* Query Response Display (No mutation confirmation needed) */}
      {result && !draftAction && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl bg-white border border-[#E6E4DC] p-5 sm:p-6 space-y-4"
        >
          <div className="text-xs text-[#525B54]">
            {t.assistant.heardLabel}: <span className="font-medium text-[#141B16]">“{result.transcript}”</span>
          </div>
          <p className="text-base text-[#141B16] leading-relaxed">{result.action.replyMessage}</p>

          {result.action.intent === 'query_today_sales' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DC]">
                <div className="text-xs text-[#525B54]">{t.dashboard.todayRevenue}</div>
                <div className="mt-1 text-lg font-bold font-mono-num text-[#141B16]">
                  {formatINR(todaySummary.revenue)}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DC]">
                <div className="text-xs text-[#525B54]">{t.dashboard.todayExpenses}</div>
                <div className="mt-1 text-lg font-bold font-mono-num text-[#DC2626]">
                  {formatINR(todaySummary.expenses)}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DC]">
                <div className="text-xs text-[#525B54]">{t.dashboard.estimatedProfit}</div>
                <div className="mt-1 text-lg font-bold font-mono-num text-[#14532D]">
                  {formatINR(todaySummary.netProfit)}
                </div>
              </div>
            </div>
          )}

          {result.action.intent === 'query_low_stock' && (
            <div className="pt-2 divide-y divide-[#E6E4DC] border-t border-[#E6E4DC]">
              {lowStockList.length === 0 ? (
                <div className="py-3 text-sm text-[#14532D]">{t.dashboard.allHealthy}</div>
              ) : (
                lowStockList.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-[#141B16]">{item.name}</span>
                    <span className="font-mono-num text-[#D97706] font-semibold">
                      {item.quantity} {item.unit} (Min: {item.minThreshold})
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.section>
      )}

      {/* Try Demo Commands */}
      <section className="rounded-xl bg-white border border-[#E6E4DC] p-5">
        <h3 className="text-sm font-semibold text-[#141B16] mb-3">{t.dashboard.tryDemoCommands}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DEMO_COMMANDS.map((item) => (
            <button
              key={item.command}
              type="button"
              disabled={isProcessing}
              onClick={() => {
                setTextInput(item.command);
                void submitToGemini({ text: item.command });
              }}
              className="min-h-11 px-3.5 py-2.5 rounded-lg border border-[#E6E4DC] bg-[#FAF9F5] hover:bg-[#F3F2EC] hover:border-[#14532D]/40 text-left text-xs text-[#141B16] flex items-center justify-between gap-2 transition-colors cursor-pointer"
            >
              <span>
                <strong className="text-[#14532D] mr-2">{item.label}</strong>
                {item.command}
              </span>
              <span className="text-[11px] text-[#525B54] shrink-0">{t.actions.tryCommand}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
