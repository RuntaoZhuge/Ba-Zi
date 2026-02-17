'use client';

import { useTranslations } from 'next-intl';
import type { WuXing } from '@bazi/domain';

const WUXING_ORDER: WuXing[] = ['木', '火', '土', '金', '水'];

const WUXING_STYLES: Record<WuXing, { bg: string; bar: string }> = {
  '木': { bg: 'bg-green-50', bar: 'bg-green-500' },
  '火': { bg: 'bg-red-50', bar: 'bg-red-500' },
  '土': { bg: 'bg-yellow-50', bar: 'bg-yellow-500' },
  '金': { bg: 'bg-gray-50', bar: 'bg-gray-500' },
  '水': { bg: 'bg-blue-50', bar: 'bg-blue-500' },
};

interface WuxingChartProps {
  distribution: Record<WuXing, number>;
}

export function WuxingChart({ distribution }: WuxingChartProps) {
  const t = useTranslations('bazi');
  const maxValue = Math.max(...Object.values(distribution), 1);

  return (
    <div className="space-y-3">
      {WUXING_ORDER.map((wx) => {
        const count = distribution[wx];
        const pct = (count / maxValue) * 100;
        const styles = WUXING_STYLES[wx];
        return (
          <div key={wx} className="flex items-center gap-3">
            <span className="w-12 text-sm font-medium">{t(`wuxing.${wx}`)}</span>
            <div className={`h-6 flex-1 rounded-full ${styles.bg}`}>
              <div
                className={`h-6 rounded-full ${styles.bar} transition-all duration-500`}
                style={{ width: `${Math.max(pct, 8)}%` }}
              />
            </div>
            <span className="w-6 text-right text-sm text-gray-600">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
