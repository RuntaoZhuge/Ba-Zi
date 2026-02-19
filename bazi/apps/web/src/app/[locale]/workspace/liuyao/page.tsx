'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { calculateLiuyao } from '@bazi/domain';
import type { LiuyaoInput, LiuyaoResult } from '@bazi/domain';
import { LiuyaoForm } from '@/components/liuyao/liuyao-form';
import { HexagramDisplay } from '@/components/liuyao/hexagram-display';
import { LiuyaoAnalysisPanel } from '@/components/liuyao/analysis-panel';
import { LiuyaoHistoryPanel } from '@/components/liuyao/history-panel';
import { saveToLiuyaoHistory } from '@/lib/liuyao-history';

export default function LiuyaoPage() {
  const t = useTranslations('liuyao');
  const [result, setResult] = useState<LiuyaoResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const handleSubmit = (input: LiuyaoInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = calculateLiuyao(input);
      setResult(res);
      saveToLiuyaoHistory(input, res);
      setHistoryKey((k) => k + 1);
    } catch {
      setError(t('errors.calculationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (_input: LiuyaoInput, historyResult: LiuyaoResult) => {
    setResult(historyResult);
    setError(null);
  };

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="mt-1 text-gray-500">{t('subtitle')}</p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <LiuyaoForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Hexagram Display */}
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <HexagramDisplay result={result} />
            </section>

            {/* AI Analysis */}
            <LiuyaoAnalysisPanel result={result} />
          </div>
        )}
      </div>

      {/* Right sidebar — History */}
      <aside className="hidden w-64 shrink-0 xl:block">
        <div className="sticky top-8">
          <LiuyaoHistoryPanel onSelect={handleHistorySelect} refreshKey={historyKey} />
        </div>
      </aside>
    </div>
  );
}
