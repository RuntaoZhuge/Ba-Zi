'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { calculateLiuren } from '@bazi/domain';
import type { LiurenInput, LiurenResult } from '@bazi/domain';
import { LiurenForm } from '@/components/liuren/liuren-form';
import { BoardDisplay } from '@/components/liuren/board-display';
import { LiurenAnalysisPanel } from '@/components/liuren/analysis-panel';
import { LiurenHistoryPanel } from '@/components/liuren/history-panel';
import { saveToLiurenHistory } from '@/lib/liuren-history';

export default function LiurenPage() {
  const t = useTranslations('liuren');
  const [result, setResult] = useState<LiurenResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const handleSubmit = (input: LiurenInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = calculateLiuren(input);
      setResult(res);
      saveToLiurenHistory(input, res);
      setHistoryKey((k) => k + 1);
    } catch {
      setError(t('errors.calculationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (_input: LiurenInput, historyResult: LiurenResult) => {
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
          <LiurenForm onSubmit={handleSubmit} isLoading={isLoading} />
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
            {/* Board Display */}
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <BoardDisplay result={result} />
            </section>

            {/* AI Analysis */}
            <LiurenAnalysisPanel result={result} />
          </div>
        )}
      </div>

      {/* Right sidebar — History */}
      <aside className="hidden w-64 shrink-0 xl:block">
        <div className="sticky top-8">
          <LiurenHistoryPanel onSelect={handleHistorySelect} refreshKey={historyKey} />
        </div>
      </aside>
    </div>
  );
}
