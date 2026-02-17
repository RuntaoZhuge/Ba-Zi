'use client';

import { useTranslations } from 'next-intl';
import type { FourPillars, Pillar, WuXing } from '@bazi/domain';

const WUXING_COLORS: Record<WuXing, string> = {
  '木': 'bg-green-100 text-green-800 border-green-300',
  '火': 'bg-red-100 text-red-800 border-red-300',
  '土': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  '金': 'bg-gray-100 text-gray-800 border-gray-300',
  '水': 'bg-blue-100 text-blue-800 border-blue-300',
};

interface PillarChartProps {
  fourPillars: FourPillars;
  dayMaster: string;
}

export function PillarChart({ fourPillars, dayMaster }: PillarChartProps) {
  const t = useTranslations('bazi.result');

  const pillars: { key: string; label: string; pillar: Pillar | null }[] = [
    { key: 'year', label: t('yearPillar'), pillar: fourPillars.year },
    { key: 'month', label: t('monthPillar'), pillar: fourPillars.month },
    { key: 'day', label: t('dayPillar'), pillar: fourPillars.day },
    { key: 'hour', label: t('hourPillar'), pillar: fourPillars.hour },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[400px] grid-cols-4 gap-3">
        {pillars.map(({ key, label, pillar }) => (
          <div
            key={key}
            className="rounded-xl border border-gray-200 bg-white p-4 text-center"
          >
            <div className="mb-3 text-xs font-medium text-gray-500">
              {label}
            </div>

            {pillar ? (
              <>
                {/* Heavenly Stem */}
                <div
                  className={`mb-2 rounded-lg border p-3 text-2xl font-bold ${WUXING_COLORS[pillar.stemWuXing]}`}
                >
                  {pillar.stemBranch.stem}
                  {key === 'day' && (
                    <div className="mt-1 text-xs font-normal">
                      {t('dayMaster')}
                    </div>
                  )}
                </div>

                {/* Earthly Branch */}
                <div
                  className={`mb-2 rounded-lg border p-3 text-2xl font-bold ${WUXING_COLORS[pillar.branchWuXing]}`}
                >
                  {pillar.stemBranch.branch}
                </div>

                {/* Hidden Stems */}
                <div className="mt-2">
                  <div className="mb-1 text-xs text-gray-400">
                    {t('hiddenStems')}
                  </div>
                  <div className="flex justify-center gap-1">
                    {pillar.hiddenStems.map((hs, i) => (
                      <span
                        key={i}
                        className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {hs}
                      </span>
                    ))}
                  </div>
                </div>

                {/* NaYin */}
                <div className="mt-2 text-xs text-gray-400">
                  {pillar.naYin}
                </div>

                {/* DiShi (地势) */}
                {pillar.diShi && (
                  <div className="mt-1 text-xs text-gray-500">
                    <span className="text-gray-400">{t('diShi')}: </span>
                    {pillar.diShi}
                  </div>
                )}

                {/* XunKong (旬空) */}
                {pillar.xunKong && (
                  <div className="mt-1 text-xs text-gray-400">
                    <span>{t('xunKong')}: </span>
                    {pillar.xunKong}
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-[180px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
                <span className="text-sm text-gray-400">
                  {t('hourUnknown')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
