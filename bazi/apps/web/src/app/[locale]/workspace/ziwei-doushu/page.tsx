'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { calculateZiwei } from '@bazi/domain';
import type { ZiweiInput, ZiweiResult } from '@bazi/domain';
import { ZiweiBirthForm } from '@/components/ziwei/birth-form';
import { PalaceChart } from '@/components/ziwei/palace-chart';
import { ZiweiAnalysisPanel } from '@/components/ziwei/analysis-panel';
import { ZiweiHistoryPanel } from '@/components/ziwei/history-panel';
import { saveToZiweiHistory } from '@/lib/ziwei-history';

export default function ZiweiDoushuPage() {
  const t = useTranslations('ziwei');
  const [result, setResult] = useState<ZiweiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const handleSubmit = (input: ZiweiInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = calculateZiwei(input);
      setResult(res);
      saveToZiweiHistory(input, res);
      setHistoryKey((k) => k + 1);
    } catch {
      setError(t('errors.calculationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (_input: ZiweiInput, historyResult: ZiweiResult) => {
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
          <ZiweiBirthForm onSubmit={handleSubmit} isLoading={isLoading} />
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
            {/* Palace Chart */}
            <section>
              <h2 className="mb-4 text-lg font-semibold">{t('result.chart')}</h2>
              <PalaceChart chart={result.chart} />
            </section>

            {/* Lunar Info + Decade Luck Summary */}
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">{t('result.lunarInfo')}</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  {result.lunarInfo.yearStem}{result.lunarInfo.yearBranch}年
                  {result.lunarInfo.isLeap ? '闰' : ''}
                  {result.lunarInfo.month}月{result.lunarInfo.day}日
                  {' '}{result.lunarInfo.hourBranch}时
                </p>
                <p>
                  {t('result.wuxingJu')}: <span className="font-medium">{result.chart.wuxingJu}</span>
                  {' · '}
                  {t('result.mingZhu')}: <span className="font-medium">{result.chart.mingZhu}</span>
                  {' · '}
                  {t('result.shenZhu')}: <span className="font-medium">{result.chart.shenZhu}</span>
                </p>
              </div>
            </section>

            {/* Decade Luck */}
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">{t('result.decadeLuck')}</h2>
              <div className="flex flex-wrap gap-2">
                {result.decadeLucks.slice(0, 10).map((luck, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-center text-xs"
                  >
                    <div className="font-medium text-gray-800">{luck.stem}{luck.branch}</div>
                    <div className="text-gray-400">{luck.ageRange}岁</div>
                    <div className="text-[10px] text-gray-300">{luck.palaceName}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Analysis */}
            <ZiweiAnalysisPanel result={result} />
          </div>
        )}
      </div>

      {/* Right sidebar — History */}
      <aside className="hidden w-64 shrink-0 xl:block">
        <div className="sticky top-8">
          <ZiweiHistoryPanel onSelect={handleHistorySelect} refreshKey={historyKey} />
        </div>
      </aside>
    </div>
  );
}
