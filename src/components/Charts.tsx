import { useState } from 'react';
import type { CategoryBreakdownItem, DailySeriesPoint } from '../utils/analytics';
import { formatINR } from '../utils/analytics';

interface WeeklyChartProps {
  data: DailySeriesPoint[];
  revenueLabel: string;
  expenseLabel: string;
}

export function RevenueExpenseBarChart({ data, revenueLabel, expenseLabel }: WeeklyChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(
    500,
    ...data.map((d) => Math.max(d.revenue, d.expenses))
  );

  const chartHeight = 190;
  const barAreaHeight = 150;

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-5 mb-3 text-xs text-[#525B54]">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#14532D]" />
          {revenueLabel}
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#D97706]" />
          {expenseLabel}
        </span>
      </div>

      <div className="relative">
        {/* Tooltip */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-[#141B16] text-white text-xs flex flex-wrap items-center justify-between gap-4">
            <span className="font-medium">{data[hoveredIdx].date}</span>
            <div className="flex items-center gap-4 font-mono-num tabular-nums">
              <span>{revenueLabel}: {formatINR(data[hoveredIdx].revenue)}</span>
              <span>{expenseLabel}: {formatINR(data[hoveredIdx].expenses)}</span>
              <span className={data[hoveredIdx].profit >= 0 ? 'text-emerald-300' : 'text-amber-300'}>
                Profit: {formatINR(data[hoveredIdx].profit)}
              </span>
            </div>
          </div>
        )}

        <div
          className="grid gap-2 items-end pt-2 border-b border-[#E6E4DC]"
          style={{
            gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
            height: `${chartHeight}px`,
          }}
        >
          {data.map((point, idx) => {
            const revHeight = Math.max(point.revenue > 0 ? 6 : 2, Math.round((point.revenue / maxVal) * barAreaHeight));
            const expHeight = Math.max(point.expenses > 0 ? 6 : 0, Math.round((point.expenses / maxVal) * barAreaHeight));
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={point.date}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(hoveredIdx === idx ? null : idx)}
                className={`flex flex-col items-center justify-end h-full pb-2 rounded-t-md cursor-pointer transition-colors ${
                  isHovered ? 'bg-[#F3F2EC]' : ''
                }`}
              >
                <div className="flex items-end justify-center gap-1 w-full px-1">
                  <div
                    className="w-3 sm:w-4 bg-[#14532D] rounded-t transition-all duration-200"
                    style={{ height: `${revHeight}px` }}
                    title={`${revenueLabel}: ${formatINR(point.revenue)}`}
                  />
                  {expHeight > 0 && (
                    <div
                      className="w-2.5 sm:w-3 bg-[#D97706] rounded-t transition-all duration-200"
                      style={{ height: `${expHeight}px` }}
                      title={`${expenseLabel}: ${formatINR(point.expenses)}`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="grid gap-2 pt-2"
          style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
        >
          {data.map((point) => (
            <div key={point.date} className="text-center text-[11px] text-[#525B54] truncate">
              {point.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ExpenseBreakdownChart({ items }: { items: CategoryBreakdownItem[] }) {
  if (items.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-[#525B54]">
        No expenses recorded in this period.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.category} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[#141B16]">{item.category}</span>
            <span className="font-mono-num tabular-nums text-[#141B16]">
              {formatINR(item.amount)} <span className="text-xs text-[#525B54]">({item.percentage}%)</span>
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#F3F2EC] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#14532D] transition-all duration-300"
              style={{ width: `${Math.max(4, item.percentage)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
