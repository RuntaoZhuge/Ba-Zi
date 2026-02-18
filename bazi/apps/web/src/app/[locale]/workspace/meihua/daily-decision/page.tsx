'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { calculateMeihua } from '@bazi/domain';
import type { MeihuaInput, MeihuaResult } from '@bazi/domain';
import { DivinationForm } from '@/components/meihua/divination-form';
import { HexagramDisplay } from '@/components/meihua/hexagram-display';
import { TiYongPanel } from '@/components/meihua/tiyong-panel';
import { MeihuaAnalysisPanel } from '@/components/meihua/analysis-panel';
import { MeihuaHistoryPanel } from '@/components/meihua/history-panel';
import { saveToMeihuaHistory } from '@/lib/meihua-history';

export default function MeihuaDailyDecisionPage() {
  const t = useTranslations('meihua');
  const [result, setResult] = useState<MeihuaResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const handleSubmit = (input: MeihuaInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = calculateMeihua(input);
      setResult(res);
      saveToMeihuaHistory(input, res);
      setHistoryKey((k) => k + 1);
    } catch {
      setError(t('errors.calculationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (_input: MeihuaInput, historyResult: MeihuaResult) => {
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
          <DivinationForm onSubmit={handleSubmit} isLoading={isLoading} />
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
            {/* Three Hexagrams */}
            <section>
              <h2 className="mb-4 text-lg font-semibold">
                {t('result.hexagrams')}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <HexagramDisplay
                  hexagram={result.benGua}
                  changingLine={result.changingLine}
                  label={t('result.benGua')}
                />
                <HexagramDisplay
                  hexagram={result.huGua}
                  label={t('result.huGua')}
                />
                <HexagramDisplay
                  hexagram={result.bianGua}
                  label={t('result.bianGua')}
                />
              </div>
            </section>

            {/* Changing Line */}
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-lg font-semibold">
                {t('result.changingLine')}
              </h2>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-red-600">
                  {t('result.changingLine')} {result.changingLine}
                </span>
                {result.changingLineCi && (
                  <span className="ml-2 text-gray-500">— {result.changingLineCi}</span>
                )}
              </p>
            </section>

            {/* Ti-Yong Relationship */}
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-4 text-lg font-semibold">
                {t('result.tiYong')}
              </h2>
              <TiYongPanel tiYong={result.tiYong} />
            </section>

            {/* AI Analysis */}
            <MeihuaAnalysisPanel result={result} />
          </div>
        )}
      </div>

      {/* Right sidebar — History */}
      <aside className="hidden w-64 shrink-0 xl:block">
        <div className="sticky top-8">
          <MeihuaHistoryPanel onSelect={handleHistorySelect} refreshKey={historyKey} />
        </div>
      </aside>
    </div>
  );
}
