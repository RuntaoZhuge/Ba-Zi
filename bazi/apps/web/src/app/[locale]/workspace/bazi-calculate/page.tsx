'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef } from 'react';
import { calculateBaZi } from '@bazi/domain';
import type { BirthInput, BaZiResult } from '@bazi/domain';
import { BirthForm } from '@/components/bazi/birth-form';
import { PillarChart } from '@/components/bazi/pillar-chart';
import { WuxingChart } from '@/components/bazi/wuxing-chart';
import { ShiShenTable } from '@/components/bazi/shishen-table';
import { DaYunTimeline } from '@/components/bazi/dayun-timeline';
import { AnalysisPanel } from '@/components/bazi/analysis-panel';
import { HistoryPanel } from '@/components/bazi/history-panel';
import { saveToHistory } from '@/lib/bazi-history';

export default function BaZiCalculatePage() {
  const t = useTranslations('bazi');
  const [result, setResult] = useState<BaZiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const nameRef = useRef('');

  const handleSubmit = (input: BirthInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = calculateBaZi(input);
      setResult(res);
      saveToHistory(input, res, nameRef.current || undefined);
      setHistoryKey((k) => k + 1);
    } catch (err) {
      if (err instanceof Error && err.message.includes('1900-2100')) {
        setError(t('errors.dateOutOfRange'));
      } else {
        setError(t('errors.calculationFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (_input: BirthInput, historyResult: BaZiResult) => {
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
          <BirthForm onSubmit={handleSubmit} isLoading={isLoading} onNameChange={(n) => { nameRef.current = n; }} />
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
            {/* Four Pillars */}
            <section>
              <h2 className="mb-4 text-lg font-semibold">
                {t('result.fourPillars')}
              </h2>
              <PillarChart
                fourPillars={result.chart.fourPillars}
                dayMaster={result.chart.dayMaster}
              />
            </section>

            {/* MingGe */}
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-lg font-semibold">
                {t('result.mingge')}
              </h2>
              <p className="text-gray-700">{result.chart.mingge}</p>
            </section>

            {/* Five Elements */}
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-4 text-lg font-semibold">
                {t('result.wuxingDistribution')}
              </h2>
              <WuxingChart distribution={result.chart.wuxingDistribution} />
            </section>

            {/* Ten Gods */}
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-4 text-lg font-semibold">
                {t('result.shishen')}
              </h2>
              <ShiShenTable
                shishen={result.chart.shishen}
                fourPillars={result.chart.fourPillars}
              />
            </section>

            {/* Palaces (命宫/身宫/胎元/胎息) */}
            {(result.chart.mingGong || result.chart.taiYuan) && (
              <section className="rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="mb-3 text-lg font-semibold">
                  {t('result.palaces')}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  {result.chart.mingGong && (
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                      <div className="text-xs text-gray-400">{t('result.mingGong')}</div>
                      <div className="mt-1 text-lg font-bold">{result.chart.mingGong.ganZhi}</div>
                      <div className="text-xs text-gray-400">{result.chart.mingGong.naYin}</div>
                    </div>
                  )}
                  {result.chart.shenGong && (
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                      <div className="text-xs text-gray-400">{t('result.shenGong')}</div>
                      <div className="mt-1 text-lg font-bold">{result.chart.shenGong.ganZhi}</div>
                      <div className="text-xs text-gray-400">{result.chart.shenGong.naYin}</div>
                    </div>
                  )}
                  {result.chart.taiYuan && (
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                      <div className="text-xs text-gray-400">{t('result.taiYuan')}</div>
                      <div className="mt-1 text-lg font-bold">{result.chart.taiYuan.ganZhi}</div>
                      <div className="text-xs text-gray-400">{result.chart.taiYuan.naYin}</div>
                    </div>
                  )}
                  {result.chart.taiXi && (
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                      <div className="text-xs text-gray-400">{t('result.taiXi')}</div>
                      <div className="mt-1 text-lg font-bold">{result.chart.taiXi.ganZhi}</div>
                      <div className="text-xs text-gray-400">{result.chart.taiXi.naYin}</div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ShenSha (神煞) */}
            {result.chart.shensha.length > 0 && (
              <section className="rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="mb-3 text-lg font-semibold">
                  {t('result.shensha')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.chart.shensha.map((ss, i) => (
                    <span
                      key={i}
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        ss.description === '吉神'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {ss.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* NaYin */}
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">
                {t('result.nayin')}
              </h2>
              <div className="grid grid-cols-4 gap-3 text-center text-sm">
                <div>
                  <div className="text-xs text-gray-400">{t('result.yearPillar')}</div>
                  <div className="font-medium">{result.chart.nayin.year}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">{t('result.monthPillar')}</div>
                  <div className="font-medium">{result.chart.nayin.month}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">{t('result.dayPillar')}</div>
                  <div className="font-medium">{result.chart.nayin.day}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">{t('result.hourPillar')}</div>
                  <div className="font-medium">
                    {result.chart.nayin.hour ?? t('result.hourUnknown')}
                  </div>
                </div>
              </div>
            </section>

            {/* Fortune Cycles */}
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-4 text-lg font-semibold">
                {t('result.dayun')}
              </h2>
              <DaYunTimeline yun={result.yun} liuNian={result.liuNian} result={result} />
            </section>

            {/* AI Overview Analysis */}
            <AnalysisPanel result={result} />
          </div>
        )}
      </div>

      {/* Right sidebar — History */}
      <aside className="hidden w-64 shrink-0 xl:block">
        <div className="sticky top-8">
          <HistoryPanel onSelect={handleHistorySelect} refreshKey={historyKey} />
        </div>
      </aside>
    </div>
  );
}
