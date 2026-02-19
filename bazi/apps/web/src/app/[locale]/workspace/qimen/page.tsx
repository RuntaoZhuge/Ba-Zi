'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { calculateQimen } from '@bazi/domain';
import type { QimenInput, QimenResult } from '@bazi/domain';
import { QimenForm } from '@/components/qimen/qimen-form';
import { BoardDisplay } from '@/components/qimen/board-display';
import { QimenAnalysisPanel } from '@/components/qimen/analysis-panel';
import { QimenHistoryPanel } from '@/components/qimen/history-panel';
import { saveToQimenHistory } from '@/lib/qimen-history';

export default function QimenPage() {
  const t = useTranslations('qimen');
  const [result, setResult] = useState<QimenResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const handleSubmit = (input: QimenInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = calculateQimen(input);
      setResult(res);
      saveToQimenHistory(input, res);
      setHistoryKey((k) => k + 1);
    } catch {
      setError(t('errors.calculationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (_input: QimenInput, historyResult: QimenResult) => {
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
          <QimenForm onSubmit={handleSubmit} isLoading={isLoading} />
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
            {/* Board Info Bar */}
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>{t('result.dayGanZhi')}: <span className="font-medium text-gray-900">{result.dayGanZhi}</span></span>
                <span>{t('result.hourGanZhi')}: <span className="font-medium text-gray-900">{result.hourGanZhi}</span></span>
                <span>{t('result.dunType')}: <span className="font-medium text-gray-900">{result.board.dunType}{result.board.juNumber}局</span></span>
                <span>{t('result.jieQi')}: <span className="font-medium text-gray-900">{result.board.jieQi}</span></span>
                <span>{t('result.yuan')}: <span className="font-medium text-gray-900">{result.board.yuan}</span></span>
              </div>
            </section>

            {/* Board Display */}
            <section>
              <h2 className="mb-4 text-lg font-semibold">{t('result.board')}</h2>
              <BoardDisplay board={result.board} />
            </section>

            {/* AI Analysis */}
            <QimenAnalysisPanel result={result} />
          </div>
        )}
      </div>

      {/* Right sidebar — History */}
      <aside className="hidden w-64 shrink-0 xl:block">
        <div className="sticky top-8">
          <QimenHistoryPanel onSelect={handleHistorySelect} refreshKey={historyKey} />
        </div>
      </aside>
    </div>
  );
}
