import { useState, type FormEvent } from 'react';
import { AlertCircle, Loader2, MessageSquare, Send } from 'lucide-react';
import type { TranslationStrings } from '../i18n/translations';
import type { AdvisorMessage, Language, ShopData } from '../types';
import type { FinancialSummary } from '../utils/analytics';

interface AdvisorViewProps {
  t: TranslationStrings;
  language: Language;
  shopData: ShopData;
  todayDate: string;
  todaySummary: FinancialSummary;
  allTimeSummary: FinancialSummary;
}

export function AdvisorView({
  t,
  language,
  shopData,
  todayDate,
}: AdvisorViewProps) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const userMsg: AdvisorMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/assistant/advise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          history: nextMessages,
          language,
          shopName: shopData.shopName,
          todayDate,
          inventory: shopData.inventory,
          transactions: shopData.transactions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get business advice.');
      }

      const aiMsg: AdvisorMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach Gemini AI Business Advisor.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void askQuestion(input);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-xl bg-white border border-[#E6E4DC] p-5 sm:p-6">
        <h2 className="text-xl font-bold text-[#141B16]">{t.advisor.title}</h2>
        <p className="mt-1 text-sm text-[#525B54]">{t.advisor.subtitle}</p>

        {/* Suggested Questions */}
        <div className="mt-4 pt-4 border-t border-[#E6E4DC]">
          <div className="text-xs font-medium text-[#525B54] mb-2.5">{t.advisor.starterLabel}</div>
          <div className="flex flex-wrap gap-2">
            {t.advisor.starters.map((q) => (
              <button
                key={q}
                type="button"
                disabled={loading}
                onClick={() => void askQuestion(q)}
                className="min-h-10 px-3.5 py-2 rounded-lg border border-[#E6E4DC] bg-[#FAF9F5] hover:bg-[#F3F2EC] hover:border-[#14532D]/40 text-xs font-medium text-[#141B16] text-left transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Conversation Window */}
      <div className="rounded-xl bg-white border border-[#E6E4DC] flex flex-col min-h-[380px]">
        <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[480px]">
          {messages.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-[#14532D] mx-auto opacity-70" />
              <div className="text-sm font-medium text-[#141B16]">
                Ask anything about {shopData.shopName}
              </div>
              <p className="text-xs text-[#525B54] max-w-md mx-auto">
                Answers are calculated strictly from your real inventory, sales, and expenses.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#14532D] text-white'
                      : 'bg-[#FAF9F5] border border-[#E6E4DC] text-[#141B16]'
                  }`}
                >
                  <div>{msg.content}</div>
                  <div
                    className={`mt-1.5 text-[11px] ${
                      msg.role === 'user' ? 'text-emerald-100' : 'text-[#525B54]'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-3 bg-[#FAF9F5] border border-[#E6E4DC] text-sm text-[#525B54] inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#14532D]" />
                <span>Analyzing your shop data...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-[#E6E4DC] flex gap-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.advisor.placeholder}
            disabled={loading}
            className="flex-1 h-12 px-4 rounded-xl border border-[#E6E4DC] bg-[#FAF9F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-12 px-5 rounded-xl bg-[#14532D] hover:bg-[#166534] disabled:opacity-50 text-white text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{t.actions.send}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
